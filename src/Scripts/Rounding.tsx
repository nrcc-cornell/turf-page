export default function roundXDigits( number: number, digits: number ): number {
  if (typeof number === 'string') {
    number = parseFloat(number);
  }
  
  const res: string = (Math.round( number * Math.pow(10, digits) ) / Math.pow(10, digits)).toFixed(digits);
  
  return parseFloat(res);
}