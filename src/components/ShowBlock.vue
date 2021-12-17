<template>
  <v-container>
    <v-snackbar
        v-model="snackbar"
        :bottom="true"
        :timeout="5000"
      >
        {{ snackbarText }}
      <v-btn dark text @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <v-row>
      <v-col cols="2">
        <v-text-field v-model="height" label="Block Height" type="number"></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="fetchBlockData" class="my-3">
          <span class="caption">Get Block Data</span>
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-show="Object.keys(blockData).length > 0">
      <v-col cols="3">
        <div>Block Time:
          <strong>{{ moment.unix(blockData.time).format('dddd, MMMM Do, YYYY h:mm:ss A') }}</strong>
        </div>
      </v-col>
      <v-col cols="3">
        <div>Number of all transactions in the block: <strong>{{ blockData.n_tx }}</strong></div>
      </v-col>
      <v-col cols="3">
        <div>Number of tether transactions in the block:
          <strong>{{ blockData.n_tethers }}</strong>
        </div>
      </v-col>
    </v-row>
    <v-row v-show="Object.keys(blockData).length > 0">
      <v-col cols="3">
        <div>Sum of all tether transactions:
          <strong>{{ formatUSD(blockData.sum) }}</strong>
        </div>
      </v-col>
      <v-col cols="6">
        <div>Block Hash: <strong>{{ blockData.hash }}</strong></div>
      </v-col>
    </v-row>
    <v-row v-show="Object.keys(blockData).length > 0">
      <v-col cols="3">
        <div>Maximum tether transaction: <strong>{{ formatUSD(maxTetherTx) }}</strong></div>
      </v-col>
    </v-row>
    <v-row v-if="Object.keys(blockData).length > 0">
      <v-col cols="12">
        <div class="chart-wrapper">
          <chart :options="chartOptionsBar"></chart>
        </div>
      </v-col>
      <v-switch v-model="barLabels" label="Bar Labels"></v-switch>
    </v-row>
    <v-row v-show="Object.keys(blockData).length > 0">
      <v-col cols="12">
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Tx Nr.</th>
              <th class="text-left">USD Value</th>
              <th class="text-left">Tx Time</th>
              <th class="text-left">BTC Price Before</th>
              <th class="text-left">BTC Time Before</th>
              <th class="text-left">BTC Price After</th>
              <th class="text-left">BTC Time After</th>
              <th class="text-left">Diff</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tx, i) in blockData.tether_transactions"
              :key="i"
              v-bind:style=" { color: colorForValue(tx.nValue).color,
                              backgroundColor: colorForValue(tx.nValue).backgroundColor }">
              <td>{{ tx.ntx }}</td>
              <td>{{ formatUSD(tx.nValue) }}</td>
              <td>{{ moment.unix(tx.time).format('dddd, MMMM Do, YYYY h:mm:ss A') }}</td>
              <td>{{ formatUSD(tx.btcPriceBefore) }}</td>
              <td>{{ moment.unix(tx.btcTimeBefore).format('dddd, MMMM Do, YYYY h:mm:ss A') }}</td>
              <td>{{ formatUSD(tx.btcPricesAfter[4]) }}</td>
              <td>
                {{ moment.unix(tx.btcTimesAfter[4]).format('dddd, MMMM Do, YYYY h:mm:ss A') }}
              </td>
              <td v-if="tx.btcPricesAfter[4] === tx.btcPriceBefore">
                <v-icon>drag_handle</v-icon>
              </td>
              <td v-else-if="tx.btcPricesAfter[4] > tx.btcPriceBefore">
                <v-icon color="green">arrow_upward</v-icon>
              </td>
              <td v-else><v-icon color="red">arrow_downward</v-icon></td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as dbutils from '@/lib/dbutils';
import * as grab from '@/lib/httpmethods';
import * as txutils from '@/lib/txutils';

export default {
  name: 'ShowBlock',

  data: () => ({
    loader: null,
    height: null,
    blockData: {},
    maxTetherTx: 0,
    test: null,
    snackbar: false,
    snackbarText: null,
    barLabels: false,
    chartOptionsBar: {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      legend: {
        data: ['Tether Value', 'BTC Price'],
      },
      xAxis: {
        data: [],
      },
      yAxis: [
        {
          type: 'value',
          name: 'Tether Value USD',
          axisLabel: {
            formatter: '{value} USD',
          },
        },
        {
          type: 'value',
          name: 'BTC Price USD',
          axisLabel: {
            formatter: '{value} USD',
          },
        },
      ],
      series: [
        {
          name: 'Tether Value',
          type: 'bar',
          label: {
            show: false,
            position: 'inside',
            formatter(params) {
              const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              });
              return formatter.format(params.data);
            },
          },
          data: [],
        },
        {
          name: 'BTC Price Before',
          type: 'line',
          yAxisIndex: 1,
          data: [],
        },
        {
          name: 'BTC Price After',
          type: 'line',
          yAxisIndex: 1,
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
      // color: ['#127ac2', '#556B2F'],
      color: ['#6495ED', '#006400', '#DC143C'],
    },
  }),
  async created() {
    this.loader = this.$loading.show({
      loader: 'bars',
      opacity: 0.85,
      transition: 'none',
      height: 128,
      width: 128,
      'is-full-page': true,
      'background-color': '#FF0000',
    });

    // this.height = await grab.getLastBlockHeight();
    const nH = await dbutils.dbGetLastID();
    this.height = nH.toString();
    this.loader.hide();
  },
  watch: {
    barLabels(val) {
      this.chartOptionsBar.series[0].label.show = val;
    },
  },
  methods: {
    async fetchBlockData() {
      this.blockData = {};

      this.loader = this.$loading.show({
        loader: 'bars',
        opacity: 0.85,
        transition: 'none',
        height: 128,
        width: 128,
        'is-full-page': true,
        'background-color': '#FF0000',
      });

      if (!this.height) {
        this.snackbarText = 'Invalid Block Height';
        this.snackbar = true;
        this.loader.hide();
        return;
      }

      const nHeight = parseInt(this.height, 10);
      if (Number.isNaN(nHeight)) {
        this.snackbarText = 'Invalid Block Height';
        this.snackbar = true;
        this.loader.hide();
        return;
      }

      if (nHeight < 0) {
        this.snackbarText = 'Invalid Block Height';
        this.snackbar = true;
        this.loader.hide();
        return;
      }

      // check if the block exist in the DB
      const bExists = await dbutils.dbBlockExists(this.height);
      if (!bExists) {
        this.snackbarText = 'No data for given block - trying to fetch and set into DB';
        this.snackbar = true;
        const lbh = await grab.getLastBlockHeight();
        const nlbh = parseInt(lbh, 10);

        if (nHeight > nlbh) {
          this.snackbarText = `Given height is too big - last block height is ${lbh}`;
          this.snackbar = true;
        } else {
          try {
            await dbutils.grabAndSetBlock(this.height);
          } catch (err) {
            this.snackbarText = err;
            this.snackbar = true;
          }
        }
      }

      const bD = await dbutils.dbGetBlock(this.height);
      if (bD) {
        this.blockData = bD;

        // set up bar chart
        this.chartOptionsBar.xAxis.data = [];
        this.chartOptionsBar.series[0].data = [];
        this.chartOptionsBar.series[1].data = [];
        this.chartOptionsBar.series[2].data = [];

        this.blockData.tether_transactions.forEach((tr) => {
          this.chartOptionsBar.xAxis.data.push(tr.ntx);
          this.chartOptionsBar.series[0].data.push(tr.nValue);
          this.chartOptionsBar.yAxis[0].interval = -1;
          const nBPB = parseFloat(tr.btcPriceBefore, 10);
          this.chartOptionsBar.series[1].data.push(nBPB);
          const nBPA5 = parseFloat(tr.btcPricesAfter[4], 10);
          this.chartOptionsBar.series[2].data.push(nBPA5);
        });

        const minV1 = Math.round(Math.min(...this.chartOptionsBar.series[1].data));
        const maxV1 = Math.round(Math.max(...this.chartOptionsBar.series[1].data));
        const minV2 = Math.round(Math.min(...this.chartOptionsBar.series[2].data));
        const maxV2 = Math.round(Math.max(...this.chartOptionsBar.series[2].data));
        const minV = Math.min(minV1, minV2);
        const maxV = Math.max(maxV1, maxV2);

        let intervalV = Math.round((maxV - minV) / 25);
        if (intervalV < 1) intervalV = 1;
        this.chartOptionsBar.yAxis[1].min = minV - intervalV;
        this.chartOptionsBar.yAxis[1].max = maxV + intervalV;
        this.chartOptionsBar.yAxis[1].interval = intervalV;

        this.maxTetherTx = txutils.getMaxTetherTransactionValue(this.blockData);
      }
      this.loader.hide();
    },
    colorForValue(value) {
      const ret = { color: 'black', backgroundColor: 'white' };
      const nV = parseInt(value, 10);
      if (nV > 1000000) {
        ret.color = 'red';
        ret.backgroundColor = '#F8F8FF';
        return ret;
      }
      if (nV > 100000) {
        ret.color = 'blue';
        ret.backgroundColor = '#F0F8FF';
        return ret;
      }
      if (nV > 10000) {
        ret.color = 'green';
        ret.backgroundColor = '#F5FFFA';
        return ret;
      }
      return ret;
    },
    formatUSD(num) {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      return formatter.format(num);
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
