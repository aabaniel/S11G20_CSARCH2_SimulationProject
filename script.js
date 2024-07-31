// Global object to store state and results
const globalState = {
    inputType: '',
    hexInput: '',
    binaryInput: '',
    decimalType: '',
    decimalResult: '',
    binaryRepresentation: '',
    detailedResult: null
};

function toggleInputFields() {
    globalState.inputType = $('#inputType').val();
    if (globalState.inputType === 'hex') {
        $('#hexInputField').show();
        $('#binaryInputField').hide();
    } else {
        $('#hexInputField').hide();
        $('#binaryInputField').show();
    }
}

function convert() {
    $('#decimalResult').text(''); // Clear previous result

    try {
        globalState.inputType = $('#inputType').val();
        globalState.hexInput = $('#hexInput').val().trim();
        globalState.binaryInput = $('#binaryInput').val().replace(/\s+/g, '');
        globalState.decimalType = $('#decimalType').val();
        globalState.decimalResult = '';

        if (globalState.inputType === 'hex') {
            if (isValidHex(globalState.hexInput)) {
                globalState.binaryRepresentation = hexToBinary(globalState.hexInput);
                globalState.detailedResult = binaryToDecimal(globalState.binaryRepresentation);
                const specialCaseResult = checkSpecialCases(globalState.binaryRepresentation);
                if (specialCaseResult !== null) {
                    globalState.decimalResult = specialCaseResult;
                } else {
                    globalState.decimalResult = globalState.decimalType === 'fixed' 
                        ? Number(globalState.detailedResult.decimal).toFixed(2)
                        : `${globalState.detailedResult.significand} * ${globalState.detailedResult.base}^${globalState.detailedResult.exponent}`;
                }
            } else {
                alert('Invalid Hexadecimal Input');
                return;
            }
        } else {
            if (isValidBinary(globalState.binaryInput)) {
                globalState.detailedResult = binaryToDecimal(globalState.binaryInput);
                const specialCaseResult = checkSpecialCases(globalState.binaryInput);
                if (specialCaseResult !== null) {
                    globalState.decimalResult = specialCaseResult;
                } else {
                    globalState.decimalResult = globalState.decimalType === 'fixed'
                        ? Number(globalState.detailedResult.decimal).toFixed(2)
                        : `${globalState.detailedResult.significand} * ${globalState.detailedResult.base}^${globalState.detailedResult.exponent}`;
                }
            } else {
                alert('Invalid Binary Input');
                return;
            }
        }

        $('#decimalResult').text(globalState.decimalResult);
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

function hexToBinary(hex) {
    try {
        return parseInt(hex, 16).toString(2).padStart(32, '0');
    } catch (error) {
        console.error('Error converting hex to binary:', error);
        throw error;
    }
}

function binaryToDecimal(binary) {
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
    const significand = mantissaValue.toFixed(2);
    const base = 10; // Use base 10 for floating-point representation

    return {
        decimal,
        significand,
        base,
        exponent
    };
}

function checkSpecialCases(binary) {
    const exponent = binary.slice(1, 9);
    const mantissa = binary.slice(9);

    if (binary === '00000000000000000000000000000000') return 'Zero';
    if (binary === '10000000000000000000000000000000') return '-Zero';
    if (exponent === '11111111') {
        if (parseInt(mantissa, 2) === 0) return binary[0] === '0' ? 'Infinity' : '-Infinity';
        return 'NaN';
    }
    return null;
}

function checkHexSpecialCases(hex) {
    const binary = hexToBinary(hex);
    return checkSpecialCases(binary);
}

function copyToNotepad() {
    // Check if there is a result to save
    if (!globalState.decimalResult) {
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
    content += `Input Type Selected: ${globalState.inputType === 'hex' ? '8-digit Hexadecimal' : '32-bit Binary'}\n`;
    if (globalState.inputType === 'hex') {
        content += `Hexadecimal Input Provided: ${globalState.hexInput}\n`;
        const binaryRepresentation = hexToBinary(globalState.hexInput);
        content += `Equivalent 32-bit Binary Representation: ${formatBinary(binaryRepresentation)}\n`;
    } else {
        content += `32-bit Binary Input Provided: ${formatBinary(globalState.binaryInput)}\n`;
        content += `Equivalent 8-digit Hexadecimal Representation: ${binaryToHex(globalState.binaryInput)}\n`;
    }
    content += `Decimal Output Type Selected: ${globalState.decimalType === 'fixed' ? 'Fixed Point' : 'Floating Point'}\n`;

    // Include detailed floating point representation if available
    if (globalState.decimalType === 'fixed') {
        content += `\nResult: ${Number(globalState.detailedResult.decimal).toFixed(2)}\n`;
    } else {
        content += `\nResult: ${globalState.detailedResult.significand} * ${globalState.detailedResult.base}^${globalState.detailedResult.exponent}\n`;
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
