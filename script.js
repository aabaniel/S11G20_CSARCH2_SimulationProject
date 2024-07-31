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
            if (isValidHex(hexInput)) {
                result = hexToDecimal(hexInput);
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
            // Include negative sign if the number is negative
            const resultString = result.decimal < 0 ? 
                `-${Math.abs(result.significand).toFixed(2)} * ${result.base}^${result.exponent}` : 
                `${Math.abs(result.significand).toFixed(2)} * ${result.base}^${result.exponent}`;
            $('#decimalResult').text(resultString);
        }
    } catch (error) {
        console.error('Error during conversion:', error);
        alert('An error occurred during conversion. Check the console for details.');
    }
}

function isValidHex(hex) {
    return /^[0-9A-Fa-f]{8}$/.test(hex);
}

function isValidBinary(binary) {
    return /^[01]{32}$/.test(binary);
}

function hexToDecimal(hex) {
    // Convert hexadecimal to binary
    const binary = parseInt(hex, 16).toString(2).padStart(32, '0');
    return binaryToDecimal(binary);
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
    const base = 2;
    const detailedResult = {
        decimal,
        significand,
        base,
        exponent
    };

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

    return binarySpecialCases[value] || null;
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

    // Check special cases for hexadecimal input
    return hexSpecialCases[hex] || null;
}

function copyToNotepad() {
    // Collect input values
    const inputType = $('#inputType').val();
    const hexInput = $('#hexInput').val();
    const binaryInput = $('#binaryInput').val().replace(/\s+/g, '');
    const decimalType = $('#decimalType').val();
    const decimalResult = $('#decimalResult').text();

    // Check if there is a result to save
    if (!decimalResult) {
        alert('No result to copy.');
        return;
    }

    // Convert hexadecimal to binary
    function hexToBinary(hex) {
        return parseInt(hex, 16).toString(2).padStart(32, '0');
    }

    // Convert binary to hexadecimal
    function binaryToHex(binary) {
        return parseInt(binary, 2).toString(16).toUpperCase().padStart(8, '0');
    }

    // Format binary with spaces
    function formatBinary(binary) {
        return `${binary[0]} ${binary.slice(1, 9)} ${binary.slice(9)}`;
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

    // Include detailed floating point representation if available
    const detailedResult = binaryToDecimal(inputType === 'hex' ? hexToBinary(hexInput) : binaryInput);
    if (typeof detailedResult === 'object') {
        if (decimalType === 'fixed') {
            content += `\nResult: ${Number(detailedResult.decimal).toFixed(2)}\n`;
        } else {
            content += `\nResult: ${detailedResult.significand} * ${detailedResult.base}^${detailedResult.exponent}\n`;
        }
    } else {
        content += `\nResult: ${detailedResult}\n`;
    }

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = 'FloatingPointResult.txt';
    link.href = window.URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
