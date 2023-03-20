class Node {
  value: number;
  next: Node | null;
  
  constructor(val: number) {
    this.value = val;
    this.next = null;
  }
}

export default class ArrSummer {
  first: Node | null;
  last: Node | null;
  length: number;
  
  constructor() {
    this.first = null;
    this.last = null;
    this.length = 0;
  }

  add(val: number) {
    const newNode = new Node(val);

    if (!this.first) {
      this.first = newNode;
      this.last = newNode;
    } else if (this.last) {
      this.last.next = newNode;
      this.last = newNode;
    }

    return ++this.length;
  }

  remove() {
    if (!this.first) return null;

    const deqed = this.first;
    if (this.first === this.last) {
      this.last = null;
    }
    this.first = deqed.next;

    this.length--;
    return deqed.value;
  }
  
  sum() {
    let sum = 0;
    
    if (this.first) {
      let temp: Node | null = this.first;
      while(temp) {
        sum += temp.value;
        temp = temp.next;
      }
    }
    
    return sum;
  }

  unshiftPop(val: number) {
    if (val === -999) val = 0;
    
    if (this.length < 7) {
      this.add(val);
      return false;
    } else {
      const total = this.sum();
      this.add(val);
      this.remove();
      return total;
    }
  }
}