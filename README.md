# Goss Installation action

This action installs and caches [Goss](https://goss.rocks/) of the required version.

It includes:

- `goss`
- `dgoss`
- `dcgoss`
- `kgoss`

Read more about Goss at https://goss.rocks/.

## Inputs

### `version`

**Optional** The required version of Goss to install. Default `"v0.3.14"`.

## Example usage

```yml
uses: e1himself/goss-installation-action
with:
  version: 'v0.3.14'
```
