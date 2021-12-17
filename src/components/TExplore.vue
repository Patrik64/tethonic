<template>
  <v-container fluid>
    <v-layout wrap>
      <v-btn type="button"
        id="idFillLastBlock"
        class="btn"
        @click="dbFillLastBlock">Fill Last Block
      </v-btn>
      <v-btn type="button"
        id="idGrabLastBlock"
        class="btn btn-danger submit-ctrl"
        @click="grabLastBlock">Get Last Block
      </v-btn>
    </v-layout>
    <v-flex mb-4>
        <div>Number of all transactions in the block: {{ blockData.n_tx }}</div>
        <div>Block height: {{ blockData.height }}</div>
        <div>List of all tether transactions: </div>

        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Tx Nr.</th>
              <th class="text-left">USD Value</th>
              <th class="text-left">Tx Time</th>
              <th class="text-left">BTC Price</th>
              <th class="text-left">BTC Price At Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tx, i) in blockData.tether_transactions" :key="i">
              <td>{{ tx.ntx }}</td>
              <td>{{ tx.nValue }}</td>
              <td>{{ moment.unix(tx.time).format('dddd, MMMM Do, YYYY h:mm:ss A') }}</td>
              <td>{{ tx.btcPrice }}</td>
              <td>{{ moment.unix(tx.btcTime).format('dddd, MMMM Do, YYYY h:mm:ss A') }}</td>
            </tr>
          </tbody>
        </v-simple-table>
        <div>
          Number of tether transactions in the block: {{ blockData.tether_transactions.length }}
        </div>
        <div>
          Sum of all tether transactions in the block: {{ blockData.sum }} USD
        </div>
     </v-flex>
    <div class="chart-wrapper">
      <chart :options="chartOptionsBar"></chart>
    </div>
    <!--div class="chart-wrapper">
      <chart :options="chartOptionsLine"></chart>
    </div-->
  </v-container>
</template>

<script>
import axios from 'axios';
import { db } from '../firebase.tethonic';

export default {
  name: 'TExplore',

  data: () => ({
    blockData: {
      n_tx: null,
      n_tether: null,
      height: null,
      sum: null,
      tether_transactions: [],
    },
    loader: null,
    chartOptionsBar: {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        data: [],
      },
      yAxis: {
        type: 'value',
        name: 'USD',
      },
      series: [
        {
          type: 'bar',
          name: 'USD',
          label: {
            show: true,
            position: 'inside',
          },
          data: [],
        },
      ],
      title: {
        text: 'Tether Values',
        x: 'center',
        textStyle: {
          fontSize: 24,
        },
      },
      color: ['#127ac2'],
    },
    chartOptionsLine: {
      xAxis: {
        data: [],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          type: 'bar',
          data: [],
        },
      ],
      title: {
        text: 'BTC Price',
        x: 'center',
        textStyle: {
          fontSize: 24,
        },
      },
      color: ['#127ac2'],
    },
  }),
  methods: {
    sumAllTetherTranactions() {
      let sum = 0;
      this.blockData.tether_transactions.forEach((tr) => {
        sum += tr.nValue;
      });
      return sum;
    },
    async dbFillLastBlock() {
      this.loader = this.$loading.show({
        loader: 'bars',
        opacity: 0.85,
        transition: 'none',
        height: 128,
        width: 128,
        'is-full-page': true,
        'background-color': '#FF0000',
      });

      const docID = this.blockData.height.toString();

      db.collection('blocks').doc(docID).set({
        ...this.blockData,
      })
        .then(() => { this.loader.hide(); })
        .catch((error) => { console.error('Error writing document: ', error); });
    },
    async grabLastBlock() {
      // activate loader icon
      this.blockData.n_tx = null;
      this.blockData.height = null;
      this.blockData.tether_transactions = [];

      this.loader = this.$loading.show({
        loader: 'bars',
        opacity: 0.85,
        transition: 'none',
        height: 128,
        width: 128,
        'is-full-page': true,
        'background-color': '#FF0000',
      });

      const loadUrl = 'https://blockchain.info/q/latesthash';
      await axios.get(loadUrl)
        .then((res) => {
          const { data } = res;
          if (data) {
            // this.blockData = data;
            // console.log(data);
            this.fetchBlockByHash(data);
          }
        })
        .catch(error => console.log(error));
    },
    async fetchBlockByHash(blockHash) {
      const loadUrl = `https://blockchain.info/rawblock/${blockHash}?cors=true`;
      fetch(loadUrl)
        .then(response => response.json())
        .then((blockJson) => {
          this.processBlock(blockJson);
        });
    },
    async processBlock(blockJson) {
      this.blockData.n_tx = blockJson.n_tx;
      this.blockData.height = blockJson.height;
      let i = 0;
      blockJson.tx.forEach((tr) => {
        const tether = this.processTransaction(tr);
        if (tether) {
          tether.ntx = i;
          tether.time = tr.time;
          this.blockData.tether_transactions.push(tether);
        }
        i += 1;
      });
      const pArr = [];
      for (let k = 0; k < this.blockData.tether_transactions.length; k += 1) {
        const uxtime = this.blockData.tether_transactions[k].time;
        let promiseBTC = 0;
        promiseBTC = this.fetchBitcoinPriceAtTime(uxtime);
        pArr.push(promiseBTC);
      }

      Promise.all(pArr).then((values) => {
        for (let v = 0; v < values.length; v += 1) {
          this.blockData.tether_transactions[v].btcPrice = values[v].priceUsd;
          this.blockData.tether_transactions[v].btcTime = values[v].time;
        }

        this.blockData.tether_transactions.sort((a, b) => {
          if (a.time < b.time) {
            return -1;
          }
          if (a.time > b.time) {
            return 1;
          }
          return 0;
        });

        // set up bar chart
        this.chartOptionsBar.xAxis.data = [];
        this.chartOptionsBar.series[0].data = [];
        this.chartOptionsLine.xAxis.data = [];
        this.chartOptionsLine.series[0].data = [];

        this.blockData.tether_transactions.forEach((tr) => {
          this.chartOptionsBar.xAxis.data.push(tr.ntx);
          this.chartOptionsBar.series[0].data.push(tr.nValue);

          this.chartOptionsLine.xAxis.data.push(tr.ntx);
          this.chartOptionsLine.series[0].data.push(tr.btcPrice);
        });
        this.blockData.sum = this.sumAllTetherTranactions();
        this.blockData.n_tether = this.blockData.tether_transactions.length;

        this.$forceUpdate();
        this.loader.hide();
      }).catch(error => console.log(`promise all error -> ${error}`));

      // setTimeout(() => { this.$forceUpdate(); }, 3000);
    },
    processTransaction(tr) {
      const transaction = {};
      tr.out.forEach((out) => {
        if (out.script) {
          const omniIdentifier = out.script.substring(4, 12);
          const tetherIdentifier = out.script.substring(26, 28);
          if (omniIdentifier === '6f6d6e69' && tetherIdentifier === '1f') {
            transaction.script = out.script;
            const strValue = out.script.substring(28, 44);
            if (strValue) {
              const nValue = parseInt(strValue, 16);
              transaction.nValue = nValue / 100000000;
            }
          }
        }
      });
      if (transaction.nValue) {
        return transaction;
      }
      return null;
    },
    async fetchBitcoinPriceAtTime(uxtime) {
      const ret = {};
      const ttime = `${uxtime}000`;
      const nStartTime = parseInt(ttime, 10);
      const nEndTime = nStartTime + 60000;
      const strStartTime = nStartTime.toString();
      const strEndTime = nEndTime.toString();
      const loadUrl = `https://api.coincap.io/v2/assets/bitcoin/history?interval=m1&start=${strStartTime}&end=${strEndTime}`;
      await axios.get(loadUrl)
        .then((res) => {
          const { data } = res;
          if (data) {
            // console.log(data.data);
            ret.priceUsd = data.data[0].priceUsd;
            const temp = data.data[0].time;
            ret.time = (temp - (temp % 1000)) / 1000;
          }
        })
        .catch(error => console.log(error));
      return ret;
    },
  },
};
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 700px;
}
.echarts {
  width: 100%;
  height: 100%;
}
</style>
