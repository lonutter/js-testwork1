/**
 * Калькулятор
 * Считает сумму к выплате и дату возврата
 *
 * @param sum   number  Сумма займа
 * @param days  int     Количество дней
 * @constructor
 */
function Calculator(sum, days) {
    this.sum = sum;
    this.days = days;
    this.rate = 0.00135;
    this.date = new Date;
}

/**
 * Считает сумму к выплате
 *
 * @returns {string}    Сумма к выплате
 */
Calculator.prototype.calculate = function() {
    var result = this.sum + ((this.sum * this.days) * this.rate);   //Формулв
    return result.toFixed(2);   //Не забываем про округление до сотых (что бы вообще всегда показывались сотые)
};

/**
 * Высчитывает дату возврата и форматирует ее в нужно виде
 *
 * @returns {string}    отформатированная дата возврата денег
 */
Calculator.prototype.getDate = function() {
    //отталкиваемся от сегодняшнего дня
    this.date.setYear(new Date().getFullYear());
    this.date.setMonth(new Date().getMonth());
    this.date.setDate(new Date().getDate() + this.days);    //И прибавляем количество дней из слайдера

    //Форматируем и возвращаем дату
    return this.date.toLocaleString('ru', {
        year: 'numeric',
        month:'long',
        day:'numeric'
    });
};

Calculator.prototype.dayWord = function() {
    var remain = this.days % 10;

    if ((this.days >= 5 && this.days <= 20) || (remain >= 5 && remain <= 9) || remain === 0) {
        return this.days + ' дней';
    } else if (remain === 1) {
        return this.days + ' день';
    } else if (remain > 1 && remain < 5) {
        return this.days + ' дня';
    }
};