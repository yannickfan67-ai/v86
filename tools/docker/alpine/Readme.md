You can build an Alpine Linux 9p image using Docker:

1. As needed, edit the kernel flavor (`virt` is smaller than `lts`) and the set of additional packages in `Dockerfile`. The community repository is enabled by default.
2. With Docker running (`podman` also works), review and run `./build.sh`.
3. Run a local web server (for example, `make run`) and open `examples/alpine.html`.
4. Optionally, run `./build-state.js` and add `initial_state: { url: "../images/alpine-state.bin.zst" }` to `alpine.html`.
