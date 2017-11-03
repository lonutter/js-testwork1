/**
 * Аналог для input[type=range]
 *
 * @param element
 * @param unit  string Единица измерения для сдвигов. Проценты или пиксели. По умолчанию %
 * @constructor
 */
function SliderInput(element, unit) {
    this.unit = '%';

    if (['%', 'px'].indexOf(unit) !== -1) {
        this.unit = unit;
    } else if (unit !== undefined) {
        throw new Error('Неподдерживая единица измерения для сдвигов. Укажите "%" или "px".')
    }

    //Собираем необходимые для работы слайдера данные
    this.slider = element;                                              //Сам слайдер, DOMElement
    this.sliderPosition = element.getBoundingClientRect();              //Координа слайдера
    this.scale = element.firstElementChild;                             //Шкала слайдера
    this.toddler = element.lastElementChild;                            //Ползунок
    this.width = this.sliderPosition.right - this.sliderPosition.left;  //Ширина (длина) шкалы слайдера
    this.min = parseInt(element.getAttribute('data-si-min'));           //Минимальное значения для слайдера, указывается в атрибуте data-si-min тега слайдера
    this.max = parseInt(element.getAttribute('data-si-max'));           //Аналогично предыдущему, только максимальное значение
    this.step = parseInt(element.getAttribute('data-si-step'));         //Шаг
    this.value = parseInt(element.getAttribute('data-si-value'));       //Сюда помещается значение слайдера
    this.minToddlerSteps = 0;                                           //Минимальное количество шагов
    this.currentToddlerStep = this.minToddlerSteps;                     //Текущий шаг
    this.maxToddlerSteps = (this.max - this.min) / this.step;           //Максимальное количество шагов
    this.stop = true;                                                   //Указывает на остановку слайдера, когда отжали кнопку мыши

    //Рассчитываем размер шага ползунка в зависимости от выбранной единицы измерения (% | px)
    this.toddlerStep = this.unit === 'px' ? this.width / (this.max - this.min) * this.step : 100 / (this.max - this.min) * this.step;

    //Вешаем обработчики событий
    this.toddler.addEventListener('mousedown', this.initToddler.bind(this));    //На ползунок при нажатии на ЛКМ
    document.addEventListener('mouseup', this.stopToddler.bind(this));          //На всю страницу при отжатии ЛКМ
    this.toddler.addEventListener('focus', this.arrowNavigation.bind(this));    //На ползунок при фокусе (что бы можно было стрелочками на клавиатуре двигать ползунок)
    this.slider.addEventListener('click', this.moveToddlerMouse.bind(this));    //На шкалу слайдера при клике, чтобы можно было передвинуть ползнок в место клика
}

/**
 * Инициализация ползунка.
 * Данная функция вешает обработчик moveToddler() события движения курсора мыши.
 *
 */
SliderInput.prototype.initToddler = function() {
    this.stop = false;  //Снимаем с "паузы" ползунок
    this.slider.addEventListener('mousemove', this.moveToddlerMouse.bind(this));    //Вешаем обработчик движения курсора мыши
};

/**
 * Остановка ползунка при mouseup в любой точке страницы
 * eventListener не удаляется в нашем случае.
 */
SliderInput.prototype.stopToddler = function() {
    this.stop = true;   //Это значение проверяется в обработчике мышиных событий (moveToddlerMouse)
};

/**
 * Обработка нажатия "стрелочных" клавишь при фокусе на ползуне
 */
SliderInput.prototype.arrowNavigation = function() {
    this.toddler.onkeydown = this.moveToddlerKeys.bind(this);
};

/**
 * Обработчик собатия нажатия на клавиши стрелок
 *
 * @param event object Объект события
 */
SliderInput.prototype.moveToddlerKeys = function(event) {
    if (event.keyCode === 37) { //Клавиша стрелки влево
        this.moveToddlerToPrevStep();
    } else if (event.keyCode === 39) {  //Клавиша стрелки вправо
        this.moveToddlerToNextStep();
    }
};

/**
 * Обработчик события mousemove.
 * Рассчитывает новое положение ползунка и передает ее координату в функцию, которая непосредстенно передвигает его.
 *
 * @param event
 */
SliderInput.prototype.moveToddlerMouse = function(event) {
    //Обрабатываем событие только еслт кнопка мыши не отжата или был клик в области шкалы слайдера
    if (!this.stop || event.type === 'click') {
        var cursorPosition = event.clientX - this.sliderPosition.left; //Положение курсора относительно границ (по оси X) слайдера
        var step;   //Хранит шаг, рассчитанный на основании положения курсора мыши

        //В щависимсоти от выбранной ЕИ считаем текущее положение курсора (в процентах или пикселях)
        if (this.unit === '%') {
            step = this.calculateStep((cursorPosition / this.width) * 100);
        } else if (this.unit = 'px') {
            step = this.calculateStep(cursorPosition);
        }

        this.moveToddlerToStep(step);       //Передвигаем ползунок на высчитанный шаг
    }
};

/**
 * Непосредственно передвигает ползунок.
 *
 * @param point Координата новой точки в которую нужно передвинуть ползунок
 */
SliderInput.prototype.moveToddlerTo = function(point) {
    //Что бы ползунок не ползал по всей странице, мы ему немного обламаем крылья
    if (point < 0) {
        point = 0;
    } else if (this.unit === '%' && point > 100) {
        point = 100;
    } else if (this.unit === 'px' && point > this.width) {
        point = this.width;
    }

    //Передвигаем ползунок и "закрашиваем пройденный путь"
    this.scale.style.width = point + this.unit;
    this.toddler.style.left = point + this.unit;

    //Считаем значение после сдвига и записывем его в data-si-value
    this.value = this.currentToddlerStep * this.step + this.min;
    this.slider.setAttribute('data-si-value', this.value);

    //Создадим новое событие по которому можно будет отслеживать изменение положения ползунка, а с ним и текущего значения.
    var changeEvent = new CustomEvent('si.change', {
        detail: {
            value: this.value,
            step: this.currentToddlerStep,
            toddlerPosition: this.toddler.style.left
        }
    });

    this.slider.dispatchEvent(changeEvent);     //Цепляем событие к элементу страницы (нашему сладеру)
};

/**
 * Определяет координаты переданного шага и передает их в функцию, которая двигает курсор
 *
 * @param step
 */
SliderInput.prototype.moveToddlerToStep = function(step) {
    //смотрим, что бы шаг не выходил за границы слайдера
    if (step <= this.maxToddlerSteps && step >= this.minToddlerSteps) {
        this.currentToddlerStep = step;                 //Сохраняем текущий шаг для доступа из других методов
        this.moveToddlerTo(step * this.toddlerStep);    //двигаем
    }
};

/**
 * Двигает ползунок к следующему шагу. Считает на основании текущего шага (currentToddlerStep)
 */
SliderInput.prototype.moveToddlerToNextStep = function() {
    var step;

    if ((step = this.nextStep()) !== false) {
        this.moveToddlerTo(step.position);
    }
};

/**
 * Возвращает ползунок к предыдущему шагу (аналогично moveToddlerToNextStep, только наоборот)
 */
SliderInput.prototype.moveToddlerToPrevStep = function() {
    var step;

    if ((step = this.prevStep()) !== false) {
        this.moveToddlerTo(step.position);
    }
};

/**
 * Рассчитывает порядковый номер шага на основании переданной координаты
 *
 * @param point number  Координата для рассчета шага
 * @returns {number}    Шаг
 */
SliderInput.prototype.calculateStep = function(point) {
    return Math.round(point / this.toddlerStep);
};

/**
 * Высчитывает координаты следующего шага
 *
 * @returns {boolean}
 */
SliderInput.prototype.nextStep = function() {
    var step = false;

    //Смотрим, что бы текущай шаг не выходил за границы слайдера
    if (this.currentToddlerStep < this.maxToddlerSteps) {
        step = {
            num: this.currentToddlerStep++,
            position: this.currentToddlerStep * this.toddlerStep
        };
    }
    return step;
};

/**
 * Все аналогично nextStep, только наоборот
 *
 * @returns {boolean}
 */
SliderInput.prototype.prevStep = function() {
    var step = false;

    if (this.currentToddlerStep > this.minToddlerSteps) {
        step = {
            num: this.currentToddlerStep--,
            position: this.currentToddlerStep * this.toddlerStep
        };
    }
    return step;
};

/**
 * Возвращает текущие координаты шага.
 *
 * @returns {{num: *, position: number}}
 */
SliderInput.prototype.currentStep = function() {
    return {
        num: this.currentToddlerStep,
        position: this.currentToddlerStep * this.toddlerStep
    };
};