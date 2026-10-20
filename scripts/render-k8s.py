#!/usr/bin/env python3
"""Render WSK manifests without accessing a cluster. No third-party dependencies."""
import argparse
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


def render(tag, scope='app'):
    if not re.fullmatch(r'[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}', tag) or tag == 'TAG':
        raise ValueError('Provide a concrete Docker image tag (1-128 characters).')
    directory = ROOT / 'deploy/k8s'
    app = sorted(p for p in directory.glob('*.yaml')
                 if p.name not in {'00-namespace.yaml', '30-seed-job.yaml'})
    seed = [directory / '30-seed-job.yaml']
    paths = {'app': app, 'seed': seed,
             'delete': app + seed + sorted((directory / 'optional').glob('*.yaml'))}[scope]
    # Each file can contain multiple documents; preserve explicit boundaries between files.
    return '\n---\n'.join(p.read_text(encoding='utf-8-sig').strip().replace(':TAG', ':' + tag)
                          for p in paths) + '\n'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tag', required=True)
    parser.add_argument('--scope', choices=['app', 'seed', 'delete'], default='app')
    args = parser.parse_args()
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        print(render(args.tag, args.scope), end='')
    except ValueError as error:
        parser.error(str(error))
