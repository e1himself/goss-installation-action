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

**Optional** The required version of Goss to install. Default `"latest"`.

## Example usage

```yml
uses: e1himself/goss-installation-action@v1
with:
  version: 'v0.4.4'
```
