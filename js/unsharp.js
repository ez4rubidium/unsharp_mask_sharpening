const DEBUGMODE = false;

(function(imageproc) {
    "use strict";
	imageproc.boxBlur = function(inputData, outputData, box_width, even_offset){
		console.log("Unsharp Mask: using Box Blur ...")
		// console.log(kernel.length);
		var sliding_range = Math.floor(box_width / 2);
		for (var y = 0; y < inputData.height; y++) {
			for (var x = 0; x < inputData.width; x++) {
				var sum_pixel = { r: 0, g: 0, b: 0 };
				if(box_width % 2){
					for (var j = - sliding_range; j <= sliding_range; j++) {
						for (var i = - sliding_range; i <= sliding_range; i++) {
							var kernel_pixel = imageproc.getPixel(inputData, x + i, y + j);
							// console.log("kernel_pixel: ", kernel_pixel);
							sum_pixel.r += kernel_pixel.r;
							sum_pixel.g += kernel_pixel.g;
							sum_pixel.b += kernel_pixel.b;
						}
					}
				}else{
					if(even_offset == -1)
						for (var j = - sliding_range; j <= sliding_range - 1; ++j) {
							for (var i = - sliding_range; i <= sliding_range - 1; ++i) {
								// console.log("kernel_pixel: ", kernel_pixel);
								var kernel_pixel = imageproc.getPixel(inputData, x + i, y + j);
								// console.log("kernel[" + (j + sliding_range) + "][" + (i + sliding_range) + "]: " + kernel[j + sliding_range][i + sliding_range]);
								sum_pixel.r += kernel_pixel.r;
								sum_pixel.g += kernel_pixel.g;
								sum_pixel.b += kernel_pixel.b;
							}
						}
					else if(even_offset == 1){
						for (var j = - sliding_range; j <= sliding_range - 1; ++j) {
							for (var i = - sliding_range; i <= sliding_range - 1; ++i) {
								var kernel_pixel = imageproc.getPixel(inputData, x + i + 1, y + j);
								// console.log("kernel_pixel: ", kernel_pixel);
								// console.log("kernel[" + (j + sliding_range) + "][" + (i + sliding_range) + "]: " + kernel[j + sliding_range][i + sliding_range]);
								sum_pixel.r += kernel_pixel.r;
								sum_pixel.g += kernel_pixel.g;
								sum_pixel.b += kernel_pixel.b;
							}
						}
					}else{
						console.log("Error: even_offset mismatch.");
					}
				}
				var i = (x + y * outputData.width) * 4;
				outputData.data[i]     = sum_pixel.r / (box_width ** 2);
				outputData.data[i + 1] = sum_pixel.g / (box_width ** 2);
				outputData.data[i + 2] = sum_pixel.b / (box_width ** 2);
			}
		}
	}

	imageproc.medianBlur = function(inputData, outputData, radius){
		console.log("Unsharp Mask: using Median Blur ...");
		// refering https://dl-acm-org.lib.ezproxy.hkust.edu.hk/doi/abs/10.1145/1141911.1141918
		radius = Math.abs(radius) + 1.0;
		let row, col, i, partialArr, flattenArr = new Array();
		const N = inputData.width;
		const buffer_length = 2 * Math.ceil(radius - 0.5) + 1;

		// initialize (2r + 1) * (N + 2r) Buffer, O((N + 2r)** 2) Time complexity and O((N + 2r) * (2r + 1)) Space complexity in Total 
		let histBuffer = new Array(3).fill(0).map(() => new Array(buffer_length).fill(0).map(() => new Uint8Array(buffer_length + N - 1).fill(0)));

		for(row = 0; row < buffer_length; ++row){
			for(col = 0; col < buffer_length + N - 1; ++col){
				let image_pixel = imageproc.getPixel(inputData, col - Math.floor(buffer_length / 2), row - Math.floor(buffer_length / 2));
				histBuffer[0][row][col] = image_pixel.r;
				histBuffer[1][row][col] = image_pixel.g;
				histBuffer[2][row][col] = image_pixel.b;
				// console.log("histBuffer[0][" + col + "]: R " + histBuffer[0][row][col] + " G " + histBuffer[1][row][col] + " B " + histBuffer[2][row][col]);
			}
		}

		for(col = 0; col < N; ++col){
			for(i = 0; i < 3; ++i){
				flattenArr.splice(0, flattenArr.length);
				// TODO: optimize the flatten part in O(1) time complexity
				partialArr = histBuffer[i].map(rows => rows.slice(col, buffer_length + col));
				partialArr.forEach((rows , y) => { 
					rows.forEach((ele, x) => {
						// console.log(" ele: " + ele);
						if(x + col - Math.floor(buffer_length / 2) >= 0 && x + col - Math.floor(buffer_length / 2)< inputData.width && y - Math.floor(buffer_length / 2)>= 0 && y - Math.floor(buffer_length / 2)< inputData.height){
							flattenArr.push(ele);
						}
					});
				});
				// console.log("flattenArr_length: " + flattenArr.flat(2).length + " flattenArr: " + flattenArr.flat(2));
				let m = median(flattenArr);
				// console.log("median: " + m);
				outputData.data[col * 4 + i] = m;
			}
			
		}

		for(row = 1; row  < inputData.height; ++row){
			for(i = 0; i < 3; ++i){
				histBuffer[i].shift();
				histBuffer[i].push(new Uint8Array(buffer_length + N - 1).fill(0));
				// console.log("histBuffer[0].length:", histBuffer[0].length, "histBuffer[0][2].length:", histBuffer[0][2].length);
			}
		
			for(col = 0; col < buffer_length + N - 1; ++col){
				let image_pixel = imageproc.getPixel(inputData, col - Math.floor(buffer_length / 2), row - Math.floor(buffer_length / 2) + buffer_length - 1);
				histBuffer[0][buffer_length - 1][col] = image_pixel.r;
				histBuffer[1][buffer_length - 1][col] = image_pixel.g;
				histBuffer[2][buffer_length - 1][col] = image_pixel.b;
				// console.log("histBuffer[" + (buffer_length - 1)  + "][" + col + "]: R " + histBuffer[0][buffer_length - 1][col] + " G " + histBuffer[1][buffer_length - 1][col] + " B " + histBuffer[2][buffer_length - 1][col]);
			}

			for(col = 0; col < N; ++col){
				for(i = 0; i < 3; ++i){
					flattenArr.splice(0, flattenArr.length);
					// TODO: optimize the flatten part in O(1) time complexity
					partialArr = histBuffer[i].map(rows => rows.slice(col, buffer_length + col));
					partialArr.forEach((rows, y) => { 
						rows.forEach((ele, x) => {
							if(x + col - Math.floor(buffer_length / 2) >= 0 && x + col - Math.floor(buffer_length / 2)< inputData.width && y + row - Math.floor(buffer_length / 2)>= 0 && y + row - Math.floor(buffer_length / 2)< inputData.height){
							// console.log(" ele: " + ele);
								flattenArr.push(ele);
							}
						});
					});
					// console.log("flattenArr_length: " + flattenArr.length + " flattenArr: " + flattenArr);

					
					let m = median(flattenArr);
					// console.log("median: " + m);
					outputData.data[(row * inputData.width + col) * 4 + i] = m;
				}
			}
		}	
	}

	imageproc.gaussianBlur2D = function(cmatrix2D, cmatrix2D_length, inputData, outputData){
		console.log("Unsharp Mask: using Gaussian Blur2D ...");
		const sliding_range = Math.floor(cmatrix2D_length / 2);
		for (var y = 0; y < inputData.height; y++) {
			for (var x = 0; x < inputData.width; x++) {
				let sum_pixel = { r: 0, g: 0, b: 0 };
				let scale = 0
				for (var j = - sliding_range; j <= sliding_range; ++j) {
					for (var i = - sliding_range; i <= sliding_range; ++i) {
						if(x + i >= 0 && x + i < inputData.width && y + j >= 0 && y + j < inputData.height){
							scale += cmatrix2D[j + sliding_range][i + sliding_range];
							let kernel_pixel = imageproc.getPixel(inputData, x + i, y + j);
							// console.log("kernel_pixel: ", kernel_pixel);
							sum_pixel.r += kernel_pixel.r * cmatrix2D[j + sliding_range][i + sliding_range];
							sum_pixel.g += kernel_pixel.g * cmatrix2D[j + sliding_range][i + sliding_range];
							sum_pixel.b += kernel_pixel.b * cmatrix2D[j + sliding_range][i + sliding_range];
						}
					}
				}
				
				var i = (x + y * outputData.width) * 4;
				outputData.data[i]     = Math.round(sum_pixel.r / scale);
				outputData.data[i + 1] = Math.round(sum_pixel.g / scale);
				outputData.data[i + 2] = Math.round(sum_pixel.b / scale);
			}
		}
	}

	imageproc.bilateralBlur = function(inputData, outputData, radius){
		console.log("Unsharp Mask: using Bilateral Blur ...");
		// refering https://dl-acm-org.lib.ezproxy.hkust.edu.hk/doi/abs/10.1145/1141911.1141918
		// refering https://ieeexplore.ieee.org/abstract/document/710815
		const [cmatrix2D_length, cmatrix2D] = imageproc.gen_convolve_matrix2D(radius);
		radius = Math.abs(radius) + 1.0;
		let row, col, partialArr, scale_g, scale_r, mu0, i;
		const N = inputData.width;
		const SIGMA = radius * 10; 
		// const buffer_length = 2 * Math.ceil(radius - 0.5) + 1;
		// console.log("buffer_length:", buffer_length, "cmatrix2D_length:", cmatrix2D_length);

		// initialize (2r + 1) * (N + 2r) Buffer
		let histBuffer = new Array(3).fill(0).map(() => new Array(cmatrix2D_length).fill(0).map(() => new Uint8Array(cmatrix2D_length + N - 1).fill(0)));

		for(row = 0; row < cmatrix2D_length; ++row){
			for(col = 0; col < cmatrix2D_length + N - 1; ++col){
				let image_pixel = imageproc.getPixel(inputData, col - Math.floor(cmatrix2D_length / 2), row - Math.floor(cmatrix2D_length / 2));
				histBuffer[0][row][col] = image_pixel.r;
				histBuffer[1][row][col] = image_pixel.g;
				histBuffer[2][row][col] = image_pixel.b;
				// console.log("histBuffer[0][" + col + "]: R " + histBuffer[0][row][col] + " G " + histBuffer[1][row][col] + " B " + histBuffer[2][row][col]);
			}
		}

		for(col = 0; col < N; ++col){
			let sum_pixel = new Float32Array(3).fill(0);
			let center_pixel = [
				imageproc.getPixel(inputData, col, 0).r,
				imageproc.getPixel(inputData, col, 0).g,
				imageproc.getPixel(inputData, col, 0).b
			];
			for(i = 0; i < 3; ++i){
				// TODO: optimize the time complexity for dot product computation
				scale_g = scale_r = mu0 = 0;
				partialArr = histBuffer[i].map(rows => rows.slice(col, cmatrix2D_length + col));
				partialArr.forEach((subRows, y) =>{
					subRows.forEach((ele, x) =>{
						if(x + col - Math.floor(cmatrix2D_length / 2) >= 0 && x + col - Math.floor(cmatrix2D_length / 2)< inputData.width && y + row - Math.floor(cmatrix2D_length / 2)>= 0 && y + row - Math.floor(cmatrix2D_length / 2)< inputData.height){
							// console.log("partialArr[" + y + "][" + x + "]: " + ele + " check: " + partialArr[y][x]);
							// count++;
							mu0 = Math.exp(- (((Math.hypot(center_pixel[i] - ele)) / SIGMA) ** 2) / 2);
							// ro0.push(ele);
							// console.log("mu0:", mu0);
							scale_g += cmatrix2D[y][x];
							// scale_r += mu0;
							sum_pixel[i] += ele * cmatrix2D[y][x] * mu0;
						}
					});
				});
				// console.log("scale_r:", scale_r);
				outputData.data[col * 4 + i] = Math.round(sum_pixel[i] / scale_g );
			}
			// console.log("outputData[" + col + "]: R" + outputData.data[col * 4] + " G" + outputData.data[col * 4 + 1] + " B" + outputData.data[col * 4 + 2]);
		}

		for(row = 1; row  < inputData.height; ++row){
			for(i = 0; i < 3; ++i){
				histBuffer[i].shift();
				histBuffer[i].push(new Uint8Array(cmatrix2D_length + N - 1).fill(0));
				// console.log("histBuffer[0].length:", histBuffer[0].length, "histBuffer[0][2].length:", histBuffer[0][2].length);
			}
		
			for(col = 0; col < cmatrix2D_length + N - 1; ++col){
				let image_pixel = imageproc.getPixel(inputData, col - Math.floor(cmatrix2D_length / 2), row - Math.floor(cmatrix2D_length / 2) + cmatrix2D_length - 1);
				histBuffer[0][cmatrix2D_length - 1][col] = image_pixel.r;
				histBuffer[1][cmatrix2D_length - 1][col] = image_pixel.g;
				histBuffer[2][cmatrix2D_length - 1][col] = image_pixel.b;
				// console.log("histBuffer[" + (buffer_length - 1)  + "][" + col + "]: R " + histBuffer[0][buffer_length - 1][col] + " G " + histBuffer[1][buffer_length - 1][col] + " B " + histBuffer[2][buffer_length - 1][col]);
			}

			for(col = 0; col < N; ++col){
				let sum_pixel = new Float32Array(3).fill(0);
				let center_pixel = [
					imageproc.getPixel(inputData, col, row).r,
					imageproc.getPixel(inputData, col, row).g,
					imageproc.getPixel(inputData, col, row).b
				];
				for(i = 0; i < 3; ++i){
					// TODO: optimize the time complexity for dot product computation
					scale_g = scale_r = mu0 = 0;
					partialArr = histBuffer[i].map(rows => rows.slice(col, cmatrix2D_length + col));
					partialArr.forEach((subRows, y) =>{
						subRows.forEach((ele, x) =>{
							if(x + col - Math.floor(cmatrix2D_length / 2) >= 0 && x + col - Math.floor(cmatrix2D_length / 2) < inputData.width && y + row - Math.floor(cmatrix2D_length / 2) >= 0 && y + row - Math.floor(cmatrix2D_length / 2) < inputData.height){
								// console.log("partialArr[" + y + "][" + x + "]: " + ele + " check: " + partialArr[y][x]);
								// count++;
								mu0 = Math.exp(- (((Math.hypot(center_pixel[i] - ele)) / SIGMA) ** 2) / 2);
								// ro0.push(ele);
								scale_g += cmatrix2D[y][x];
								// scale_r += mu0;
								sum_pixel[i] += ele * cmatrix2D[y][x] * mu0;
							}
						});
					});

					// console.log("scale_r:", scale_r);
					outputData.data[(row * inputData.width + col) * 4 + i] = Math.round(sum_pixel[i] / scale_g );
				}
			}
		}
	}

	imageproc.gen_convolve_matrix2D = function(radius){
		console.log("Generate convolutional 2D matrix ...");
		let i, j, k, matrix_length, matrix_middle, sum, cmatrix;
		radius = Math.abs(radius) + 1.0;
		// align the matrix length with bilteral filtering
		const std_dev = radius / 2;
		// radius = std_dev * 2;
		
		// console.log("radius: " + radius + " std_dev: " + std_dev);

		matrix_length = 2 * Math.ceil(radius - 0.5) + 1;
		if(matrix_length <= 0)
			matrix_length = 1;
		matrix_middle = Math.floor(matrix_length / 2);
		cmatrix = Array.from({length: matrix_length}, () => new Float32Array(matrix_length).fill(0.0));
		// console.log("matrix length: " + matrix_length + " c_matrix: " + cmatrix);

		for(i = matrix_middle; i < matrix_length; ++i){
			for(j = matrix_middle; j < matrix_length; ++j){
				if(!(i == j && i == matrix_middle)){
					let base_x = Math.hypot(i - matrix_middle, j - matrix_middle);
					sum = 0;
					for(k = 1; k <= 50; ++k){
						let r = base_x + 0.02 * k;
						if(r <= radius)
							sum += Math.exp(- ((r / std_dev) ** 2) / 2);
					}
					cmatrix[i][j] = sum / 50;
				}
				// console.log("cmatrix[" + i + "][" + j + "]: " + cmatrix[i][j]);
			}
		}

		for(i = 0; i <= matrix_middle; ++i){
			for(j = 0; j <= matrix_middle; ++j){
				cmatrix[matrix_length - 1 - i][j] = cmatrix[i][matrix_length - 1 - j] = cmatrix[i][j] = cmatrix[matrix_length - 1 - i][matrix_length - 1 - j];
				// console.log("cmatrix[" + i + "]: " + cmatrix[i]);
			}
			
		}

		sum = 0;
		for(j = 0; j <= 50; ++j){
			sum += Math.exp(- (((0.5 + 0.02 * j) / std_dev) ** 2) / 2);
		}
		cmatrix[matrix_middle][matrix_middle] = sum / 51;
		// console.log("cmatrix[" + Math.floor(matrix_length / 2) + "]: " + cmatrix[Math.floor(matrix_length / 2)]);

		sum = 0;
		for (i = 0; i < matrix_length; ++i){
			for(j = 0; j < matrix_length; ++j){
				// console.log("sum: " + sum);
				sum += cmatrix[i][j];
			}
		}
		
		// console.log("sum: " + sum);

		for (i = 0; i < matrix_length; ++i){
			for(j = 0; j < matrix_length; ++j){
				cmatrix[i][j] /= sum;
				// console.log("cmatrix[" + i + "][" + j + "]: " + cmatrix[i][j]);
			}
		}
		
		// console.log("cmatrix: " + cmatrix + "\ncmatrix_length: " + matrix_length);
		return [matrix_length, cmatrix];
	}


    /*
     * Apply unsharp mask to the input data
     */
    imageproc.unsharpMask = function(inputData, outputData, type, amount, radius, threshold) {
        console.log("Applying unsharp mask...");
		var mergeBuffer = imageproc.createBuffer(inputData), unsharpBuffer = imageproc.createBuffer(inputData);
		imageproc.copyImageData(inputData, mergeBuffer);

		switch(type){
			case "box":
				const box_width = Math.round(radius * 3 * Math.sqrt(2 * Math.PI) / 4);
				if(box_width < 1){
					imageproc.copyImageData(inputData, unsharpBuffer);
					break;
				}
				if(box_width % 2){
					imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, 0);
					imageproc.boxBlur(unsharpBuffer, mergeBuffer, box_width, 0);
					imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, 0);
				}else{
					imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, -1);
					imageproc.boxBlur(unsharpBuffer, mergeBuffer, box_width, 1);
					imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width + 1, 0);
				}
				break;
			case "gaussian":
				if (radius < 10){
					const [cmatrix2D_length, cmatrix2D] = imageproc.gen_convolve_matrix2D(radius);
					// console.log("cmatrix2D: " + cmatrix2D + "\ncmatrix_length2D: " + cmatrix_length2D);
					imageproc.gaussianBlur2D(cmatrix2D, cmatrix2D_length, inputData, unsharpBuffer);

				}else{
					const box_width = Math.round(radius * 3 * Math.sqrt(2 * Math.PI) / 4);
					if(box_width < 1){
						imageproc.copyImageData(inputData, unsharpBuffer);
						break;
					}
					if(box_width % 2){
						/* Odd-width box blur: repeat 3 times, centered on output pixel.
           				 * Swap back and forth between the buffers. */
						imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, 0);
						imageproc.boxBlur(unsharpBuffer, mergeBuffer, box_width, 0);
						imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, 0);
					}else{
						/* Even-width box blur:
						 * This method is suggested by the specification for SVG.
						 * One pass with width n, centered between output and right pixel
						 * One pass with width n, centered between output and left pixel
						 * One pass with width n+1, centered on output pixel
						 * Swap back and forth between buffers.
						 */
						imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, -1);
						imageproc.boxBlur(unsharpBuffer, mergeBuffer, box_width, 1);
						imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width + 1, 0);
					}
				}
				break;
			case "median":
				imageproc.medianBlur(inputData, unsharpBuffer, radius);

				break;
			case "bilateral":
				imageproc.bilateralBlur(inputData, unsharpBuffer, radius);
				break;
			default:
		}

		for (var y = 0; y < inputData.height; y++) {
			for (var x = 0; x < inputData.width; x++) {		
				var i = (x + y * outputData.width) * 4;

				// for debug
				if(DEBUGMODE){
					outputData.data[i] = unsharpBuffer.data[i];
					outputData.data[i + 1] = unsharpBuffer.data[i + 1];
					outputData.data[i + 2] = unsharpBuffer.data[i + 2];
				}else{

				// Real Operation Code
					for(var color = 0; color < 3; ++color){
						let diff = (inputData.data[i + color] - unsharpBuffer.data[i + color]);
						if(Math.abs(2 * diff) < threshold * 64)
							diff = 0;
						let new_color = Math.max(0, Math.min(parseInt(inputData.data[i + color] + (amount / 100) * diff), 255));
						outputData.data[i + color] = new_color;
					}
				}
			}
		}
    }
 
}(window.imageproc = window.imageproc || {}));

// Radix Sort implementation in JavaScript
function radixSort(arr) {
	// Find the maximum number to determine the number of digits
	const max = Math.max(...arr);
  
	// Perform counting sort for every digit
	let exp = 1;
	while (Math.floor(max / exp) > 0) {
	  countingSort(arr, exp);
	  exp *= 10;
	}
  
	return arr;
  }
  
// Counting Sort helper function
function countingSort(arr, exp) {
	const n = arr.length;
	const output = new Array(n).fill(0);
	const count = new Array(10).fill(0);
  
	// Count occurrences of each digit
	for (let i = 0; i < n; ++i) {
		const digit = Math.floor(arr[i] / exp) % 10;
		count[digit]++;
	}
  
	// Calculate cumulative count
	for (let i = 1; i < 10; ++i) {
		count[i] += count[i - 1];
	}
  
	// Build the output array
	for (let i = n - 1; i >= 0; --i) {
		const digit = Math.floor(arr[i] / exp) % 10;
		output[count[digit] - 1] = arr[i];
		count[digit]--;
	}
  
	// Copy the output array to arr
	for (let i = 0; i < n; ++i) {
		arr[i] = output[i];
	}
}

// Median implementation in JavaScript
function median(values){
	if (!values.length) {
	  return NaN;
	}
	// Sorting values, preventing original array
	// from being mutated.

	// TODO: identify the effeciency difference of finding median between built-in sort() method and own implemented radix-Sort 
	values = values.slice().sort((a, b) => a - b);
	// values = radixSort(values);

	const half = Math.floor(values.length / 2);
  
	return (values.length % 2
	  ? values[half]
	  : (values[half - 1] + values[half]) / 2
	);
  
  }

