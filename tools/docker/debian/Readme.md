# Debian Xfce Docker example

## Split raw disk

1. Run `bash build-raw-disk.sh` to build the images.
2. Run `./build-state-raw-disk.js` to build the state image.
3. Use `examples/debian-raw-disk.html` as the example frontend.

## 9p filesystem

1. Run `bash build-9p.sh` to build the images.
2. Run `./build-state-9p.js` to build the state image.
3. Use `examples/debian-9p.html` as the example frontend.

## Serving the examples

1. Either build v86, or download a release and place `v86.wasm` and `libv86.js` in the `build` directory.
2. Launch a web server from the repository root, for example: `python3 -m http.server 8000`.
3. Open `http://localhost:8000/examples/debian-raw-disk.html` for the raw-disk example or `http://localhost:8000/examples/debian-9p.html` for the 9p example.

## Networking

Enable networking from the Xfce terminal with:

```
sudo dhclient enp0s5
```

## Credit

The v86 Debian configuration is based on sandbox-bio:
https://github.com/sandbox-bio/v86/tree/master/tools/docker/debian
