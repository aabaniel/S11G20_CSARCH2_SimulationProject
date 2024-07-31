function toggleInputFields() {
    const inputType = $('#inputType').val();
    if (inputType === 'hex') {
        $('#hexInputField').show();
        $('#binaryInputField').hide();
    } else {
        $('#hexInputField').hide();
        $('#binaryInputField').show();
    }
}

function convert() {
    $('#decimalResult').text(''); // Clear previous result

    const inputType = $('#inputType').val();
    let result = '';

    try {
        if (inputType === 'hex') {
            const hexInput = $('#hexInput').val().trim();
            console.log('Hex Input:', hexInput); // Debugging
            if (isValidHex(hexInput)) {
                const binaryRepresentation = hexToBinary(hexInput);
                console.log('Binary Representation:', binaryRepresentation); // Debugging
                result = binaryToDecimal(binaryRepresentation);
                // Check and handle special cases for hex input
                const specialCaseResult = checkHexSpecialCases(hexInput);
                if (specialCaseResult !== null) {
                    $('#decimalResult').text(specialCaseResult);
                    return;
                }
            } else {
                alert('Invalid Hexadecimal Input');
                return;
            }
        } else {
            const binaryInput = $('#binaryInput').val().replace(/\s+/g, '');
            console.log('Binary Input:', binaryInput); // Debugging
            if (isValidBinary(binaryInput)) {
                result = binaryToDecimal(binaryInput);
                // Check and handle special cases for binary input
                const specialCaseResult = checkSpecialCases(binaryInput);
                if (specialCaseResult !== null) {
                    $('#decimalResult').text(specialCaseResult);
                    return;
                }
            } else {
                alert('Invalid Binary Input');
                return;
            }
        }

        const decimalType = $('#decimalType').val();
        if (decimalType === 'fixed' && !isNaN(result.decimal)) {
            const fixedPointValue = Number(result.decimal).toFixed(2); // Adjust for fixed-point representation
            $('#decimalResult').text(fixedPointValue);
        } else if (decimalType === 'floating') {
            // Format the result in scientific notation with base 10
            const resultString = result.decimal < 0 ? 
                `-${Math.abs(result.decimal).toExponential().replace('e+', ' * 10^')}` : 
                `${Math.abs(result.decimal).toExponential().replace('e+', ' * 10^')}`;
            $('#decimalResult').text(resultString);
        }
    } catch (error) {
        console.error('Error during conversion:', error);
        alert('An error occurred during conversion. Check the console for details.');
    }
}

function isValidHex(hex) {
    // Ensure hexadecimal input is exactly 8 digits
    const valid = /^[0-9A-Fa-f]{8}$/.test(hex);
    console.log('Hex Valid:', valid); // Debugging
    return valid;
}

function isValidBinary(binary) {
    // Ensure binary input is exactly 32 digits
    const valid = /^[01]{32}$/.test(binary);
    console.log('Binary Valid:', valid); // Debugging
    return valid;
}

function hexToBinary(hex) {
    // Convert hexadecimal to binary
    try {
        const binary = parseInt(hex, 16).toString(2).padStart(32, '0');
        console.log('Hex to Binary:', binary); // Debugging
        return binary;
    } catch (error) {
        console.error('Error converting hex to binary:', error);
        throw error;
    }
}

function binaryToDecimal(binary) {
    // Convert binary to decimal
    const specialCaseResult = checkSpecialCases(binary);
    if (specialCaseResult !== null) {
        return { decimal: specialCaseResult, significand: '', base: '', exponent: '' };
    }

    const sign = parseInt(binary[0], 2);
    const exponent = parseInt(binary.slice(1, 9), 2) - 127;
    const mantissa = '1' + binary.slice(9);
    let mantissaValue = 0;

    for (let i = 0; i < mantissa.length; i++) {
        mantissaValue += parseInt(mantissa[i], 2) * Math.pow(2, -i);
    }

    const decimal = (sign ? -1 : 1) * mantissaValue * Math.pow(2, exponent);

    // Prepare detailed result
    const significand = mantissaValue.toFixed(2); // Format for better readability
    const base = 10; // Use base 10 for floating-point representation
    const detailedResult = {
        decimal,
        significand,
        base,
        exponent
    };

    console.log('Binary to Decimal Result:', detailedResult); // Debugging
    return detailedResult;
}

function checkSpecialCases(value) {
    // Define special cases for binary strings
    const binarySpecialCases = {
        '00000000000000000000000000000000': 'Zero',
        '10000000000000000000000000000000': '-Zero',
        '01111111100000000000000000000000': 'Infinity',
        '11111111100000000000000000000000': '-Infinity',
        '01111111110000000000000000000000': 'NaN'
    };

    const result = binarySpecialCases[value] || null;
    console.log('Binary Special Cases Result:', result); // Debugging
    return result;
}

function checkHexSpecialCases(hex) {
    // Define special cases for hexadecimal values
    const hexSpecialCases = {
        '00000000': 'Zero',
        '80000000': '-Zero',
        '7F800000': 'Infinity',
        'FF800000': '-Infinity',
        '7FC00000': 'NaN'
    };

    const result = hexSpecialCases[hex] || null;
    console.log('Hex Special Cases Result:', result); // Debugging
    return result;
}

function copyToNotepad() {
    // Collect input values
    const inputType = $('#inputType').val();
    const hexInput = $('#hexInput').val().trim();
    const binaryInput = $('#binaryInput').val().replace(/\s+/g, '');
    const decimalType = $('#decimalType').val();
    const decimalResult = $('#decimalResult').text().trim();

    // Check if there is a result to save
    if (!decimalResult) {
        alert('No result to copy.');
        return;
    }

    // Convert binary to hexadecimal
    function binaryToHex(binary) {
        return parseInt(binary, 2).toString(16).toUpperCase().padStart(8, '0');
    }

    // Format binary with spaces
    function formatBinary(binary) {
        return `${binary.slice(0, 1)} ${binary.slice(1, 9)} ${binary.slice(9)}`;
    }

    // Format the content of the notepad text
    let content = `IEEE-754 Binary-32 Floating Point Translator:\n\n`;

    // Add input details
    content += `Input Type Selected: ${inputType === 'hex' ? '8-digit Hexadecimal' : '32-bit Binary'}\n`;
    if (inputType === 'hex') {
        content += `Hexadecimal Input Provided: ${hexInput}\n`;
        const binaryRepresentation = hexToBinary(hexInput);
        content += `Equivalent 32-bit Binary Representation: ${formatBinary(binaryRepresentation)}\n`;
    } else {
        content += `32-bit Binary Input Provided: ${formatBinary(binaryInput)}\n`;
        content += `Equivalent 8-digit Hexadecimal Representation: ${binaryToHex(binaryInput)}\n`;
    }
    content += `Decimal Output Type Selected: ${decimalType === 'fixed' ? 'Fixed Point' : 'Floating Point'}\n`;

    // Include the result directly from HTML display
    content += `\nResult: ${decimalResult}\n`;

    // Create and download the file
    try {
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.download = 'FloatingPointResult.txt';
        link.href = window.URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error creating or downloading file:', error);
        alert('An error occurred while saving to notepad. Check the console for details.');
    }
}
