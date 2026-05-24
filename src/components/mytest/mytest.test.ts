import { describe, it, expect } from 'vitest';
import { calculateTotal } from './mytest';

describe('Функция calculateTotal', () => {
    // Внутри этой функции будут жить все тесты для calculateTotal
    it('должна корректно рассчитывать стоимость для нескольких товаров', () => {
    // 1. Arrange
    const price = 100;
    const quantity = 2;

    // 2. Act
    const result = calculateTotal(price, quantity);

    // 3. Assert
        expect(result).toBe(200); // Ожидаем, что 100 * 2 будет 200
     });    
});
