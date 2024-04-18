(function(imageproc) {
    "use strict";

    /*
     * Apply negation to the input data
     */
    imageproc.negation = function(inputData, outputData) {
        console.log("Applying negation...");

        for (var i = 0; i < inputData.data.length; i += 4) {
            outputData.data[i]     = 255 - inputData.data[i];
            outputData.data[i + 1] = 255 - inputData.data[i + 1];
            outputData.data[i + 2] = 255 - inputData.data[i + 2];
        }
    }

    /*
     * Convert the input data to grayscale
     */
    imageproc.grayscale = function(inputData, outputData) {
        console.log("Applying grayscale...");

        /**
         * TODO: You need to create the grayscale operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Find the grayscale value using simple averaging
           
            // Change the RGB components to the resulting value

            var grayscale = (inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3;
            outputData.data[i]     = grayscale;
            outputData.data[i + 1] = grayscale;
            outputData.data[i + 2] = grayscale;
        }
    }

    /*
     * Applying brightness to the input data
     */
    imageproc.brightness = function(inputData, outputData, offset) {
        console.log("Applying brightness...");

        /**
         * TODO: You need to create the brightness operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Change the RGB components by adding an offset

            for (var j = 0; j < 3; j++) {
                var value = inputData.data[i + j] + offset;                
                // Handle clipping of the RGB components
                if (value < 0) {
                    value = 0;
                }
                else if (value > 255) {
                    value = 255;
                }
                outputData.data[i + j] = value;
            }
        }
    }

    /*
     * Applying contrast to the input data
     */
    imageproc.contrast = function(inputData, outputData, factor) {
        console.log("Applying contrast...");

        /**
         * TODO: You need to create the brightness operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Change the RGB components by multiplying a factor

            for (var j = 0; j < 3; j++) {
                var value = inputData.data[i + j] * factor;
                // Handle clipping of the RGB components
                if (value > 255) {
                    value = 255;
                }
                outputData.data[i + j] = value;
            }
        }
    }

    /*
     * Make a bit mask based on the number of MSB required
     */
    function makeBitMask(bits) {
        var mask = 0;
        for (var i = 0; i < bits; i++) {
            mask >>= 1;
            mask |= 128;
        }
        return mask;
    }

    /*
     * Apply posterization to the input data
     */
    imageproc.posterization = function(inputData, outputData,
                                       redBits, greenBits, blueBits) {
        console.log("Applying posterization...");

        /**
         * TODO: You need to create the posterization operation here
         */

        // Create the red, green and blue masks
        // A function makeBitMask() is already given
        var redMask   = makeBitMask(redBits);
        var greenMask = makeBitMask(greenBits);
        var blueMask  = makeBitMask(blueBits);

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Apply the bitmasks onto the RGB channels

            outputData.data[i]     = inputData.data[i] & redMask;
            outputData.data[i + 1] = inputData.data[i + 1] & greenMask;
            outputData.data[i + 2] = inputData.data[i + 2] & blueMask;
        }
    }

    /*
     * Apply threshold to the input data
     */
    imageproc.threshold = function(inputData, outputData, thresholdValue) {
        console.log("Applying thresholding...");

        /**
         * TODO: You need to create the thresholding operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Find the grayscale value using simple averaging
            // You will apply thresholding on the grayscale value
            var grayscale = (inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3;
            var threshold = (grayscale > thresholdValue) ? 255 : 0;
           
            // Change the colour to black or white based on the given threshold

            for (var j = 0; j < 3; j++) {
                outputData.data[i + j] = threshold;
            }
        }
    }

    /*
     * Build the histogram of the image for a channel
     */
    function buildHistogram(inputData, channel) {
        var histogram = [];
        for (var i = 0; i < 256; i++)
            histogram[i] = 0;

        /**
         * TODO: You need to build the histogram here
         */

        // Accumulate the histogram based on the input channel
        // The input channel can be:
        // "red"   - building a histogram for the red component
        // "green" - building a histogram for the green component
        // "blue"  - building a histogram for the blue component
        // "gray"  - building a histogram for the intensity
        //           (using simple averaging)
        switch (channel) {
            case "gray":
                for (var i = 0; i < inputData.data.length; i += 4) {
                    var grayscale = (inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3;
                    histogram[Math.round(grayscale)]++;
                }
                break;
            case "red":
                for (var i = 0; i < inputData.data.length; i += 4)
                    histogram[inputData.data[i]]++;
                break;
            case "green":
                for (var i = 0; i < inputData.data.length; i += 4)
                    histogram[inputData.data[i + 1]]++;
                break;
            case "blue":
                for (var i = 0; i < inputData.data.length; i += 4)
                    histogram[inputData.data[i + 2]]++;
                break;
        }

        return histogram;
    }

    /*
     * Find the min and max of the histogram
     */
    function findMinMax(histogram, pixelsToIgnore) {
        var min = 0, max = 255;

        /**
         * TODO: You need to build the histogram here
         */

        // Find the minimum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
        var pixelsCount = 0;
        for (min = 0; min < 255; min++) {
            pixelsCount += histogram[min];
            if (pixelsCount > pixelsToIgnore) break;
        }
       
        // Find the maximum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
        var pixelsCount = 0;
        for (max = 255; max > min; max--) {
            pixelsCount += histogram[max];
            if (pixelsCount > pixelsToIgnore) break;
        }
        
        return {"min": min, "max": max};
    }

    /*
     * Apply automatic contrast to the input data
     */
    imageproc.autoContrast = function(inputData, outputData, type, percentage) {
        console.log("Applying automatic contrast...");

        // Find the number of pixels to ignore from the percentage
        var pixelsToIgnore = (inputData.data.length / 4) * percentage;

        var histogram, minMax;
        if (type == "gray") {
            // Build the grayscale histogram
            histogram = buildHistogram(inputData, "gray");
            // console.log(histogram.slice(0, 10).join(","));

            // Find the minimum and maximum grayscale values with non-zero pixels
            minMax = findMinMax(histogram, pixelsToIgnore);
            // console.log("pixelsToIgnore",pixelsToIgnore)
            console.log(minMax);

            var min = minMax.min, max = minMax.max, range = max - min;

            /**
             * TODO: You need to apply the correct adjustment to each pixel
             */

            for (var i = 0; i < inputData.data.length; i += 4) {
                // Adjust each pixel based on the minimum and maximum values

                outputData.data[i]     = (inputData.data[i] - min) / range * 255;
                outputData.data[i + 1] = (inputData.data[i + 1] - min) / range * 255;
                outputData.data[i + 2] = (inputData.data[i + 2] - min) / range * 255;
            }
        }
        else {

            /**
             * TODO: You need to apply the same procedure for each RGB channel
             *       based on what you have done for the grayscale version
             */
            // Build the RGB histogram
            var histogram_r = buildHistogram(inputData, "red");
            var histogram_g = buildHistogram(inputData, "green");
            var histogram_b = buildHistogram(inputData, "blue");

            // Find the minimum and maximum grayscale values with non-zero pixels
            var minMax_r = findMinMax(histogram_r, pixelsToIgnore);
            var minMax_g = findMinMax(histogram_g, pixelsToIgnore);
            var minMax_b = findMinMax(histogram_b, pixelsToIgnore);

            // console.log(minMax_r,
            //     minMax_g,
            //     minMax_b);
            // console.log(minMax_r.max - minMax_r.min
            //     , minMax_g.max - minMax_g.min
            //     , minMax_b.max - minMax_b.min);

            for (var i = 0; i < inputData.data.length; i += 4) {
                // Adjust each channel based on the histogram of each one

                outputData.data[i]     = Math.round((inputData.data[i] - minMax_r.min) / (minMax_r.max - minMax_r.min) * 255);
                outputData.data[i + 1] = Math.round((inputData.data[i + 1] - minMax_g.min) / (minMax_g.max - minMax_g.min) * 255);
                outputData.data[i + 2] = Math.round((inputData.data[i + 2] - minMax_b.min) / (minMax_b.max - minMax_b.min) * 255);
            }
        }
    }

}(window.imageproc = window.imageproc || {}));
