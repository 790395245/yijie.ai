declare module 'lunar-javascript' {
  export class Lunar {
    static fromDate(date: Date): Lunar;
    getPrevJieQi(isName: boolean): any;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    getTimeXun(): string;
    getTimeGan(): any;
  }

  export class Solar {
    static fromDate(date: Date): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }

  export class JieQi {
    getName(): string;
  }
}
