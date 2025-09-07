# objects

In this directory you will find the wayland objects delegates. This is where you can program in the actual behavior of the wayland objects.

To auto generate an object use this task:


```bash
task make-w-i-o INTERFACE=<interface_name> [FORCE=1] [GLOBAL=1]
```

Although the templates are auto generated, you will be putting custom code into the generated files. The generated files are only a starting point.
This means that this folder should be subject to version control and that you need to pass in the `FORCE=1` flag to overwrite the files (so that we don't
accidentally delete your custom code).

The GLOBAL param modifies the template slightly for global objects (doesn't take in a client when constructing, etc).
