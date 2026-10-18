#!/usr/bin/env python3
"""Offline deployment regression checks. Requires Docker Compose CLI and PyYAML."""
import importlib.util
import json
import os
from pathlib import Path
import re
import subprocess
import sys

import yaml

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('renderer', ROOT / 'scripts/render-k8s.py')
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)


def compose(extra_env=None, env_file='.env.example'):
    # Ignore developer-specific WSK overrides to test the committed template deterministically.
    env = {k: v for k, v in os.environ.items()
           if not k.startswith(('WSK_', 'COMPOSE_'))}
    env.update(extra_env or {})
    result = subprocess.run(['docker', 'compose', '--env-file', env_file,
                             '-f', 'docker-compose.yml', '-p', 'wsk-auto',
                             '--profile', 'tools', 'config', '--format', 'json'],
                            cwd=ROOT, env=env, capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def check():
    config = compose()
    legacy = {'COMPOSE_PROJECT_NAME': 'go-ecom-admin', 'MYSQL_DB_NAME': 'ecom_admin',
              'MYSQL_USER': 'ecom', 'MYSQL_PASSWORD': 'old-password', 'JWT_SECRET': 'old-secret',
              'TAG': 'legacy-image'}
    for key in ['MYSQL', 'GATEWAY', 'ES', 'ROCKETMQ_PROXY', 'ROCKETMQ_DASHBOARD',
                'JAEGER_UI', 'JAEGER_OTLP', 'PROM', 'GRAFANA', 'REDIS']:
        legacy[key + '_HOST_PORT'] = '8080'
    assert config == compose(legacy), 'Legacy environment influenced WSK rendering'
    assert config['name'] == 'wsk-auto'
    assert config['networks']['default']['name'] == 'wsk-auto_default'
    for volume in config['volumes'].values():
        assert volume['name'].startswith('wsk-auto_') and not volume.get('external')
    expected = {13316, 18090, 19210, 18091, 28090, 26696, 14327, 19090, 13010, 16389}
    published = []
    for name, service in config['services'].items():
        assert 'container_name' not in service and 'network_mode' not in service
        if service.get('build'):
            assert service['image'].startswith('wsk-auto/'), name
        for port in service.get('ports', []):
            assert port['host_ip'] == '127.0.0.1'
            published.append(int(port['published']))
        for volume in service.get('volumes', []):
            if volume['type'] == 'volume':
                assert volume['source'] in config['volumes']
            elif volume['type'] == 'bind':
                assert Path(volume['source']).resolve().is_relative_to(ROOT)
    assert set(published) == expected and len(published) == len(expected)
    for name in ['user-service', 'product-service', 'order-service', 'seed']:
        env = config['services'][name]['environment']
        assert env['MYSQL_HOST'] == 'mysql' and env['MYSQL_DB_NAME'] == 'wsk_auto'
        assert env['MYSQL_USER'] == 'wsk' and env['MYSQL_PORT'] == '3306'
    for name in ['user-service', 'product-service', 'order-service', 'api-gateway']:
        env = config['services'][name]['environment']
        assert env['SERVER_API_GATEWAY_HTTP_PORT'] == '8080'
        for svc, port in [('USER', 9001), ('PRODUCT', 9002), ('ORDER', 9003)]:
            assert env[f'SERVER_{svc}_SERVICE_GRPC_PORT'] == str(port)
    assert config['services']['seed']['profiles'] == ['tools']
    overridden = compose({'WSK_GATEWAY_HOST_PORT': '18190', 'WSK_MYSQL_DB_NAME': 'wsk_test', 'WSK_TAG': 'test-build'})
    assert overridden['services']['api-gateway']['ports'][0]['published'] == '18190'
    assert overridden['services']['seed']['environment']['MYSQL_DB_NAME'] == 'wsk_test'
    assert overridden['services']['api-gateway']['image'] == 'wsk-auto/api-gateway:test-build'
    # Compose defaults must agree with the example, even without any environment file.
    assert compose(env_file=os.devnull)['services']['api-gateway']['ports'] == config['services']['api-gateway']['ports']

    docs = []
    for path in (ROOT / 'deploy/k8s').rglob('*.yaml'):
        for doc in yaml.safe_load_all(path.read_text(encoding='utf-8-sig')):
            if not doc:
                continue
            if doc['kind'] == 'Namespace':
                assert doc['metadata']['name'] == 'wsk-auto'
            else:
                assert doc['metadata']['namespace'] == 'wsk-auto', path
            assert not re.search(r'go-ecom-admin|\becom\b|ecom_admin', json.dumps(doc))
            docs.append(doc)
    names = {(d['kind'], d['metadata']['name']) for d in docs}
    assert len(names) == len(docs), 'Duplicate resource identity'
    configmap = next(d['data'] for d in docs if d['kind'] == 'ConfigMap')
    assert configmap['MYSQL_DB_NAME'] == 'wsk_auto'
    assert configmap['SERVER_API_GATEWAY_HTTP_PORT'] == '8080'
    assert configmap['TELEMETRY_ENABLED'] == 'false'
    for doc in docs:
        pod = doc.get('spec', {}).get('template', {}).get('spec', {})
        for container in pod.get('containers', []):
            if container['name'] in ['user-service', 'product-service', 'order-service', 'api-gateway', 'seed']:
                assert container['image'].startswith('wsk-auto/')
            for ref in container.get('envFrom', []):
                if 'configMapRef' in ref: assert ('ConfigMap', ref['configMapRef']['name']) in names
                if 'secretRef' in ref: assert ('Secret', ref['secretRef']['name']) in names
            for item in container.get('env', []):
                for key, kind in [('secretKeyRef', 'Secret'), ('configMapKeyRef', 'ConfigMap')]:
                    if key in item.get('valueFrom', {}):
                        assert (kind, item['valueFrom'][key]['name']) in names
    for scope, count in [('app', 18), ('seed', 1), ('delete', 21)]:
        rendered = list(yaml.safe_load_all(renderer.render('test-wsk', scope)))
        assert len(rendered) == count, (scope, len(rendered))
        assert all(d['kind'] != 'Namespace' for d in rendered)
        assert all(d['kind'] != 'PersistentVolumeClaim' for d in rendered)
        assert ':TAG' not in renderer.render('test-wsk', scope)
        assert any(d['kind'] == 'Job' for d in rendered) == (scope != 'app')
    try:
        renderer.render('TAG')
    except ValueError:
        pass
    else:
        raise AssertionError('Unresolved image tag accepted')
    stop = (ROOT / 'scripts/dev-down.ps1').read_text(encoding='utf-8-sig')
    assert not re.search(r'Stop-Process|Get-NetTCPConnection|taskkill', stop)
    assert '.env*' in (ROOT / '.dockerignore').read_text(encoding='utf-8-sig')
    print('PASS: Compose defaults, legacy env injection, WSK overrides, 10 ports, isolated data/images, K8s resources/rendering, safe stop script')


if __name__ == '__main__':
    check()
