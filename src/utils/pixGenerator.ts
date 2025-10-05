// Função para gerar BR Code (EMV) para PIX
export const generatePixBRCode = (
  pixKey: string,
  amount: number,
  beneficiaryName: string,
  city: string = "Sao Paulo",
  txid: string = ""
): string => {
  // Helper function to create EMV tag
  const createEMVTag = (id: string, value: string): string => {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
  };

  // Payload Format Indicator
  const payloadFormatIndicator = createEMVTag('00', '01');
  
  // Merchant Account Information
  const gui = createEMVTag('00', 'br.gov.bcb.pix');
  const key = createEMVTag('01', pixKey);
  const merchantAccountInfo = createEMVTag('26', gui + key);
  
  // Merchant Category Code
  const merchantCategoryCode = createEMVTag('52', '0000');
  
  // Transaction Currency (BRL = 986)
  const transactionCurrency = createEMVTag('53', '986');
  
  // Transaction Amount
  const transactionAmount = createEMVTag('54', amount.toFixed(2));
  
  // Country Code
  const countryCode = createEMVTag('58', 'BR');
  
  // Merchant Name
  const merchantName = createEMVTag('59', beneficiaryName.substring(0, 25));
  
  // Merchant City
  const merchantCity = createEMVTag('60', city.substring(0, 15));
  
  // Additional Data Field Template
  let additionalDataField = '';
  if (txid) {
    const referenceLabel = createEMVTag('05', txid.substring(0, 25));
    additionalDataField = createEMVTag('62', referenceLabel);
  }
  
  // Concatenate all fields except CRC
  let payload = payloadFormatIndicator +
                merchantAccountInfo +
                merchantCategoryCode +
                transactionCurrency +
                transactionAmount +
                countryCode +
                merchantName +
                merchantCity +
                additionalDataField +
                '6304';
  
  // Calculate CRC16-CCITT
  const crc = calculateCRC16(payload);
  
  return payload + crc.toUpperCase();
};

// CRC16-CCITT calculation
const calculateCRC16 = (str: string): string => {
  let crc = 0xFFFF;
  
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  
  crc = crc & 0xFFFF;
  return crc.toString(16).padStart(4, '0');
};
