export function calculateNextPrice(price, volatility){
    const movement = (Math.random() - 0.5) * volatility;
    const nextPrice = price + movement;
    return Math.max(0.0001, nextPrice);


}
