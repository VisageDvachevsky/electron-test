document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const previousOperation = document.getElementById('previous-operation');
    const calculator = new Calculator(display, previousOperation);

    const historyOverlay = document.getElementById('history-overlay');
        historyOverlay.addEventListener('click', () => {
            calculator.toggleHistoryPanel();
    });
    
    const addActiveClass = (button) => {
      button.classList.add('active');
      setTimeout(() => button.classList.remove('active'), 300);
    };
  
    document.querySelector('.calculator-buttons').addEventListener('click', (event) => {
      if (!event.target.matches('button')) return;
  
      const button = event.target;
      addActiveClass(button);
      
      const action = button.dataset.action;
      const value = button.dataset.value;
  
      switch (action) {
        case 'number':
          calculator.appendNumber(value);
          break;
        case 'decimal':
          calculator.appendDecimal();
          break;
        case 'clear':
          calculator.clearAll();
          break;
        case 'toggle-sign':
          calculator.toggleSign();
          break;
        case 'percent':
          calculator.handlePercent();
          break;
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
          calculator.handleOperator(action);
          break;
        case 'calculate':
          if (calculator.operator) {
            const result = calculator.calculate();
            if (result !== undefined) {
              calculator.displayValue = String(result);
              calculator.firstOperand = result;
              calculator.waitingForSecondOperand = false;
              calculator.operator = null;
              calculator.previousValue = '';
              calculator.previousOperationElement.textContent = '';
              calculator.updateDisplay();
            }
          }
          break;
      }
    });
  
    document.getElementById('theme-toggle').addEventListener('click', () => {
      calculator.toggleTheme();
    });
  
    document.getElementById('history-toggle').addEventListener('click', () => {
      calculator.toggleHistoryPanel();
    });
  
    document.getElementById('clear-history').addEventListener('click', () => {
      calculator.clearHistory();
    });
  
    document.addEventListener('keydown', (event) => {
      const key = event.key;
      let buttonActivated = null;
  
      if (/^\d$/.test(key)) {
        event.preventDefault();
        calculator.appendNumber(key);
        buttonActivated = document.querySelector(`[data-value="${key}"]`);
      }
      
      switch (key) {
        case '+':
          event.preventDefault();
          calculator.handleOperator('add');
          buttonActivated = document.querySelector('[data-action="add"]');
          break;
        case '-':
          event.preventDefault();
          calculator.handleOperator('subtract');
          buttonActivated = document.querySelector('[data-action="subtract"]');
          break;
        case '*':
          event.preventDefault();
          calculator.handleOperator('multiply');
          buttonActivated = document.querySelector('[data-action="multiply"]');
          break;
        case '/':
          event.preventDefault();
          calculator.handleOperator('divide');
          buttonActivated = document.querySelector('[data-action="divide"]');
          break;
        case '.':
        case ',':
          event.preventDefault();
          calculator.appendDecimal();
          buttonActivated = document.querySelector('[data-action="decimal"]');
          break;
        case '%':
          event.preventDefault();
          calculator.handlePercent();
          buttonActivated = document.querySelector('[data-action="percent"]');
          break;
        case 'Enter':
        case '=':
          event.preventDefault();
          if (calculator.operator) {
            const result = calculator.calculate();
            if (result !== undefined) {
              calculator.displayValue = String(result);
              calculator.firstOperand = result;
              calculator.waitingForSecondOperand = false;
              calculator.operator = null;
              calculator.previousValue = '';
              calculator.previousOperationElement.textContent = '';
              calculator.updateDisplay();
            }
          }
          buttonActivated = document.querySelector('[data-action="calculate"]');
          break;
        case 'Escape':
          event.preventDefault();
          calculator.clearAll();
          buttonActivated = document.querySelector('[data-action="clear"]');
          break;
        case 'Backspace':
          event.preventDefault();
          calculator.delete();
          break;
      }
  
      if (buttonActivated) {
        addActiveClass(buttonActivated);
      }
    });
  });

  