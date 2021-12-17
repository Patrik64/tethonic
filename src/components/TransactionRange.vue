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
        <v-text-field v-model="heightStart" label="Start Block Height"></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-text-field v-model="heightEnd" label="End Block Height"></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="fetchData" class="my-3">
          <span class="caption">Show All Tether Transactions</span>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2">
        <v-text-field v-model="filterLimit" label="Show only values bigger than"></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="filterData" class="my-3">
          <span class="caption">Filter</span>
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-show="transactions.length > 0">
      <v-col cols="12">
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Nr.</th>
              <th class="text-left">USD Value</th>
              <th class="text-left">Tx Time</th>
              <th class="text-left">BTC Price</th>
              <th class="text-left">BTC Price At Time</th>
             </tr>
          </thead>
          <tbody>
            <tr v-for="(tx, i) in showTransactions"
              :key="i"
              v-bind:style=" { color: colorForValue(tx.nValue).color,
                             backgroundColor: colorForValue(tx.nValue).backgroundColor }">
              <td>{{ i+1 }}.</td>
              <td>{{ tx.nValue }}</td>
              <td>{{ moment.unix(tx.time).format('dddd, MMMM Do, YYYY h:mm:ss A') }}</td>
              <td>{{ tx.btcPrice }}</td>
              <td>{{ moment.unix(tx.btcTime).format('dddd, MMMM Do, YYYY h:mm:ss A') }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as dbutils from '@/lib/dbutils';
// import * as grab from '@/lib/httpmethods';

export default {
  name: 'TransactionRange',

  data: () => ({
    loader: null,
    heightStart: null,
    heightEnd: null,
    snackbar: null,
    snackbarText: null,
    filterLimit: 10000,
    blocks: null,
    transactions: [],
    showTransactions: [],
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

    this.heightStart = await dbutils.dbGetOldestID();
    this.heightEnd = await dbutils.dbGetLastID();
    this.loader.hide();
  },
  methods: {
    async fetchData() {
      this.transactions = [];

      this.loader = this.$loading.show({
        loader: 'bars',
        opacity: 0.85,
        transition: 'none',
        height: 128,
        width: 128,
        'is-full-page': true,
        'background-color': '#FF0000',
      });

      let nHS = parseInt(this.heightStart, 10);
      let nHE = parseInt(this.heightEnd, 10);

      if (nHS > nHE) {
        [nHS, nHE] = [nHE, nHS];
      }

      const nDiff = nHE - nHS;
      if (nDiff > 200) {
        this.snackbarText = 'Range is too large - keep it up to 200 blocks';
        this.snackbar = true;
        this.loader.hide();
        return;
      }

      const arrBlockPromises = [];
      for (let i = nHS; i <= nHE; i += 1) {
        const strHeight = i.toString();
        const block = dbutils.dbGetBlock(strHeight);
        arrBlockPromises.push(block);
      }

      this.blocks = await Promise.all(arrBlockPromises);

      // sort by time
      this.blocks.sort((a, b) => {
        if (a.time < b.time) {
          return -1;
        }
        if (a.time > b.time) {
          return 1;
        }
        return 0;
      });

      this.blocks.forEach((b) => {
        if (b) {
          this.transactions = [...this.transactions, ...b.tether_transactions];
        }
      });
      this.showTransactions = [...this.transactions];

      this.loader.hide();
    },
    filterData() {
      this.loader = this.$loading.show({
        loader: 'bars',
        opacity: 0.85,
        transition: 'none',
        height: 128,
        width: 128,
        'is-full-page': true,
        'background-color': '#FF0000',
      });

      this.showTransactions = this.transactions.filter((e) => {
        const nFD = parseInt(this.filterLimit, 10);
        return e.nValue > nFD;
      });
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
  },
};
</script>

<style scoped>
</style>
