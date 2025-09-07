This is a patch to the canvas node module to make it so we can
change the rpath of the canvas.node file. This is useful for
packaging the appimage.

I should probably just include canvas in the third_party directory. But
since the patch is so simple, I'll just use the patch for now.
