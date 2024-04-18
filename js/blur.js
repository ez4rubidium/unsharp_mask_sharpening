(function(imageproc) {
    "use strict";

    /*
     * Apply blur to the input data
     */
    imageproc.blur = function(inputData, outputData, kernelSize) {
        console.log("Applying blur...");

        // You are given a 3x3 kernel but you need to create a proper kernel
        // using the given kernel size
        // var kernel = [ [1, 1, 1], [1, 1, 1], [1, 1, 1] ];
        // >.< very cool(confusing) way to create a 2d array
        // create a kernel with array.from()  \/rows here              cols here\/ 
        var kernel = Array.from({ length: kernelSize }, () => Array.from({ length: kernelSize }, () => 1))
        // console.log("kernel.length: ", kernel.length);
        // console.log("kernel: ", kernel);

        /**
         * TODO: You need to extend the blur effect to include different
         * kernel sizes and then apply the kernel to the entire image
         */

        // Apply the kernel to the whole image
        var sliding_range = Math.floor(kernelSize / 2)
        // console.log("sliding_range: ", sliding_range);
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                // Use imageproc.getPixel() to get the pixel values
                // over the kernel
                // var pixel = imageproc.getPixel(inputData, x, y);
                var sum_pixel = { r: 0, g: 0, b: 0 };
                // Then set the blurred result to the output data
                for (var j = -1 * sliding_range; j <= 1 * sliding_range; j++) {
                    for (var i = -1 * sliding_range; i <= 1 * sliding_range; i++) {
                        var kernel_pixel = imageproc.getPixel(inputData, x + i, y + j);
                        // console.log("kernel_pixel: ", kernel_pixel);
                        sum_pixel.r += kernel_pixel.r * kernel[j + sliding_range][i + sliding_range];
                        sum_pixel.g += kernel_pixel.g * kernel[j + sliding_range][i + sliding_range];
                        sum_pixel.b += kernel_pixel.b * kernel[j + sliding_range][i + sliding_range];
                    }
                }
                // console.log("pixel: ", sum_pixel);
                var i = (x + y * outputData.width) * 4;
                // divide by the kernel size
                outputData.data[i] = sum_pixel.r / (kernel.length * kernel.length);
                outputData.data[i + 1] = sum_pixel.g / (kernel.length * kernel.length);
                outputData.data[i + 2] = sum_pixel.b / (kernel.length * kernel.length);
            }
        }
    } 

}(window.imageproc = window.imageproc || {}));
