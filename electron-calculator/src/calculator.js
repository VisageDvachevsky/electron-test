class Calculator {
    constructor(displayElement, previousOperationElement) {
      this.displayElement = displayElement;
      this.previousOperationElement = previousOperationElement;
      this.displayValue = '0';
      this.previousValue = '';
      this.firstOperand = null;
      this.waitingForSecondOperand = false;
      this.operator = null;
      this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
      this.clearAll();
      this.initTheme();
    }
  
    initTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('calculatorTheme');
        
        if (savedTheme === 'light') {
          document.documentElement.classList.remove('dark');
        } else if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (prefersDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('calculatorTheme', 'dark');
        }
        
        this.updateThemeIcon();
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (localStorage.getItem('calculatorTheme') === null) {
            if (e.matches) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
            this.updateThemeIcon();
          }
        });
    }
  
    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('calculatorTheme', isDark ? 'dark' : 'light');
        
        document.documentElement.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
          document.documentElement.style.transition = '';
        }, 300);
        
        this.updateThemeIcon();
      }
  
    updateThemeIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        const iconElement = themeToggle.querySelector('i');
        
        if (document.documentElement.classList.contains('dark')) {
          iconElement.setAttribute('data-lucide', 'sun');
        } else {
          iconElement.setAttribute('data-lucide', 'moon');
        }
        
        if (window.lucide) {
          lucide.createIcons({
            attrs: {
              class: 'w-5 h-5'
            },
            nameAttr: 'data-lucide'
          });
        }
      }
  
    clearAll() {
      this.displayValue = '0';
      this.previousValue = '';
      this.firstOperand = null;
      this.waitingForSecondOperand = false;
      this.operator = null;
      this.updateClearButtonText();
      this.updateDisplay();
    }
  
    delete() {
      if (this.waitingForSecondOperand) return;
      
      this.displayValue = this.displayValue.length > 1 
        ? this.displayValue.slice(0, -1) 
        : '0';
      this.updateDisplay();
    }
  
    appendNumber(number) {
      const maxLength = 9;
      
      if (this.waitingForSecondOperand) {
        this.displayValue = number;
        this.waitingForSecondOperand = false;
      } else {
        if (this.displayValue.replace(/[^\d]/g, '').length >= maxLength) {
          this.displayElement.classList.add('error-shake');
          setTimeout(() => this.displayElement.classList.remove('error-shake'), 500);
          return;
        }
        
        this.displayValue = this.displayValue === '0' ? number : this.displayValue + number;
      }
      
      this.updateClearButtonText();
      this.updateDisplay();
    }
  
    appendDecimal() {
      if (this.waitingForSecondOperand) {
        this.displayValue = '0.';
        this.waitingForSecondOperand = false;
        this.updateDisplay();
        return;
      }
  
      if (!this.displayValue.includes('.')) {
        this.displayValue += '.';
        this.updateDisplay();
      }
    }
  
    handleOperator(nextOperator) {
      const inputValue = parseFloat(this.displayValue);
      
      if (this.operator && this.waitingForSecondOperand) {
        this.operator = nextOperator;
        this.updatePreviousOperation();
        return;
      }
  
      if (this.firstOperand === null) {
        this.firstOperand = inputValue;
      } else if (this.operator) {
        const result = this.calculate();
        this.displayValue = String(result);
        this.firstOperand = result;
        
        this.addToHistory(`${this.previousValue} ${this.displayValue}`, result);
      }
  
      this.waitingForSecondOperand = true;
      this.operator = nextOperator;
      this.updatePreviousOperation();
      this.updateDisplay();
    }
  
    updatePreviousOperation() {
      const operatorSymbol = this.getOperatorSymbol(this.operator);
      this.previousValue = `${this.firstOperand} ${operatorSymbol}`;
      this.previousOperationElement.textContent = this.previousValue;
    }
  
    getOperatorSymbol(op) {
      switch (op) {
        case 'add': return '+';
        case 'subtract': return '−';
        case 'multiply': return '×';
        case 'divide': return '÷';
        default: return '';
      }
    }
  
    calculate() {
      const secondOperand = parseFloat(this.displayValue);
      if (isNaN(secondOperand)) return;
  
      let result = 0;
      switch (this.operator) {
        case 'add':
          result = this.firstOperand + secondOperand;
          break;
        case 'subtract':
          result = this.firstOperand - secondOperand;
          break;
        case 'multiply':
          result = this.firstOperand * secondOperand;
          break;
        case 'divide':
          if (secondOperand === 0) {
            this.displayValue = 'Error';
            this.displayElement.classList.add('error-shake');
            setTimeout(() => this.displayElement.classList.remove('error-shake'), 500);
            this.updateDisplay();
            return;
          }
          result = this.firstOperand / secondOperand;
          break;
        default:
          return secondOperand;
      }
  
      return this.formatNumber(result);
    }
  
    handlePercent() {
      const currentValue = parseFloat(this.displayValue);
      
      if (this.firstOperand === null) {
        this.displayValue = String(currentValue / 100);
      } else {
        const percent = currentValue / 100;
        const result = this.firstOperand * percent;
        this.displayValue = String(this.formatNumber(result));
      }
      
      this.updateDisplay();
    }
  
    toggleSign() {
        if (this.displayValue === '0') return;
        
        this.displayValue = this.displayValue.charAt(0) === '-' 
          ? this.displayValue.slice(1) 
          : '-' + this.displayValue;
        
        this.updateDisplay();
      }
  
    updateClearButtonText() {
      const clearButton = document.querySelector('[data-action="clear"]');
      if (clearButton) {
        const clearText = document.getElementById('clear-text');
        clearText.textContent = this.displayValue === '0' && this.firstOperand === null ? 'AC' : 'C';
      }
    }
  
    formatNumber(num) {
      const maxDigits = 9; 
      
      if (isNaN(num) || !isFinite(num)) {
        return 'Error';
      }
      
      const sciNotation = num.toExponential();
      const parts = sciNotation.split('e');
      const exponent = parseInt(parts[1]);
      
      if (exponent > maxDigits || exponent < -(maxDigits - 1)) {
        return num.toExponential(maxDigits - 4); 
      }
      
      if (Number.isInteger(num) && num.toString().length <= maxDigits) {
        return num.toString();
      } else {
        const integerDigits = Math.floor(Math.abs(num)).toString().length;
        const availableDecimalDigits = maxDigits - integerDigits - (num < 0 ? 1 : 0);
        
        if (availableDecimalDigits <= 0) {
          return Math.round(num).toString();
        } else {
          return parseFloat(num.toFixed(availableDecimalDigits)).toString();
        }
      }
    }
  
    updateDisplay() {
      let displayText = this.displayValue;
      
      if (!isNaN(parseFloat(displayText)) && isFinite(parseFloat(displayText))) {
        const num = parseFloat(displayText);
        displayText = this.formatNumber(num);
      }
      
      this.displayElement.textContent = displayText;
    }
  
    addToHistory(expression, result) {
        if (isNaN(result) || !isFinite(result)) return;
        
        const historyItem = {
          expression: expression,
          result: this.formatNumber(result),
          timestamp: new Date().toISOString()
        };
        
        this.history.unshift(historyItem);
        
        if (this.history.length > 10) {
          this.history = this.history.slice(0, 10);
        }
        
        try {
          localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (e) {
          console.error('Error saving history:', e);
        }
    }
  
    clearHistory() {
      this.histoaddToHistry = [];
      localStorage.removeItem('calculatorHistory');
      this.updateHistoryUI();
    }
    
    toggleHistoryPanel() {
        const historyPanel = document.getElementById('history-panel');
        const historyOverlay = document.getElementById('history-overlay');
        const isCurrentlyOpen = historyPanel.classList.contains('open');
        
        historyPanel.classList.toggle('open');
        historyOverlay.classList.toggle('open');
        
        if (isCurrentlyOpen) {
        historyPanel.classList.remove('open');
        } else {
        historyPanel.classList.add('open');
        this.updateHistoryUI(); 
        }
        
        const historyToggle = document.getElementById('history-toggle');
        const iconElement = historyToggle.querySelector('i');
        
        if (!isCurrentlyOpen) {
        iconElement.setAttribute('data-lucide', 'chevron-down');
        } else {
        iconElement.setAttribute('data-lucide', 'history');
        }
        
        if (window.lucide) {
        lucide.createIcons({
            elements: [iconElement],
            nameAttr: 'data-lucide'
        });
        }
    }
  
  updateHistoryUI() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    if (this.history.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'text-center py-4 text-gray-500';
      emptyMessage.textContent = 'No calculation history yet';
      historyList.appendChild(emptyMessage);
      return;
    }
    
    this.history.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      const expression = document.createElement('div');
      expression.className = 'text-sm text-gray-400';
      expression.textContent = item.expression;
      
      const result = document.createElement('div');
      result.className = 'text-lg font-medium';
      result.textContent = item.result;
      
      historyItem.appendChild(expression);
      historyItem.appendChild(result);
      
      historyItem.addEventListener('click', () => {
        this.displayValue = String(item.result);
        this.firstOperand = parseFloat(item.result);
        this.previousValue = '';
        this.previousOperationElement.textContent = '';
        this.operator = null;
        this.waitingForSecondOperand = false;
        this.updateDisplay();
        this.toggleHistoryPanel(); 
      });
      
      historyList.appendChild(historyItem);
    });
  }
}