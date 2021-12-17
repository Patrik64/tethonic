// eslint-disable-next-line import/prefer-default-export
export function getMaxTetherTransactionValue(block) {
  let retValue = 0;
  block.tether_transactions.forEach((el) => {
    const nValue = parseInt(el.nValue, 10);
    if (nValue > retValue) {
      retValue = nValue;
    }
  });
  return retValue;
}
