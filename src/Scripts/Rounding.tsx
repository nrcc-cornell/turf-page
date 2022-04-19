export default function roundXDigits( number: number, digits: number ): number {
  if (typeof number === 'string') {
    number = parseFloat(number);
  }
  
  const res: string = (Math.round( Math.round( number * Math.pow(10, digits + 1) ) / 10 ) / Math.pow(10, digits)).toFixed(digits);
  
  return parseFloat(res);
}