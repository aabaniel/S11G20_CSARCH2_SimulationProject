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
    let decimalResult = '';

    if (inputType === 'hex') {
        const hexInput = $('#hexInput').val();
        if (isValidHex(hexInput)) {
            decimalResult = hexToDecimal(hexInput);
        } else {
            alert('Invalid Hexadecimal Input');
            return;
        }
    } else {
        const binaryInput = $('#binaryInput').val().replace(/\s+/g, '');
        if (isValidBinary(binaryInput)) {
            decimalResult = binaryToDecimal(binaryInput);
        } else {
            alert('Invalid Binary Input');
            return;
        }
    }

    // Check and handle special cases
    const specialCaseResult = checkSpecialCases(decimalResult);
    if (specialCaseResult !== null) {
        decimalResult = specialCaseResult;
    } else {
        const decimalType = $('#decimalType').val();
        if (decimalType === 'fixed' && !isNaN(decimalResult)) {
            decimalResult = Number(decimalResult).toFixed(2); // Adjust for fixed-point representation
        }
    }

    $('#decimalResult').text(decimalResult);
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
        return specialCaseResult;
    }

    const sign = parseInt(binary[0], 2);
    const exponent = parseInt(binary.slice(1, 9), 2) - 127;
    const mantissa = '1' + binary.slice(9);
    let mantissaValue = 0;

    for (let i = 0; i < mantissa.length; i++) {
        mantissaValue += parseInt(mantissa[i], 2) * Math.pow(2, -i);
    }

    const decimal = (sign ? -1 : 1) * mantissaValue * Math.pow(2, exponent);
    return decimal;
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

    // Convert value to binary if it's hexadecimal
    if (value.length === 8) {
        const binaryValue = parseInt(value, 16).toString(2).padStart(32, '0');
        return binarySpecialCases[binaryValue] || null;
    }

    return binarySpecialCases[value] || null;
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
    content += `Calculated Decimal Result: ${decimalResult}\n`;

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = 'FloatingPointResult.txt';
    link.href = window.URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

