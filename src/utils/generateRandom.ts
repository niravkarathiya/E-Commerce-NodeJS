class RandomController {

    generateUnique11DigitNumber() {
        const number = Math.floor(10000000000 + Math.random() * 90000000000);
        return number.toString();
    }

    generateRandomDigits(length: any) {
        return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    }

    generateALBUniqueInvoiceNumber() {
        return `ALB${this.generateRandomDigits(10)}I`;
    }

    generateALBUniqueTrackingNumber() {
        return `ALB${this.generateRandomDigits(10)}T`;
    }
}

export const randomController = new RandomController();

