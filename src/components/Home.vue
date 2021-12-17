<template>
  <v-container class="grey lighten-5">
    <v-snackbar
        v-model="snackbar"
        :bottom="true"
        :timeout="5000"
      >
        {{ snackbarText }}
      <v-btn dark text @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <!--v-row>
      <v-col>
        <v-btn @click="syncDB" class="white--text" rounded block color="teal">
          <span class="caption">Sync DB</span>
        </v-btn>
      </v-col>
    </v-row-->
    <v-row>
      <v-col>
        <v-btn router to="/showblock" class="white--text" rounded block color="teal">
          <span class="caption">Show Block</span>
        </v-btn>
      </v-col>
    </v-row>
    <!--v-row>
      <v-col>
        <v-btn router to="/transactionrange" class="white--text" rounded block color="teal">
          <span class="caption">Tether Transaction Range</span>
        </v-btn>
      </v-col>
    </v-row-->
    <v-row>
      <v-col>
        <v-btn router to="/blocksum" class="white--text" rounded block color="teal">
          <span class="caption">Show Block Sums</span>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as hlp from '@/lib/httpmethods';
import * as dbutils from '@/lib/dbutils';

export default {
  data: () => ({
    loader: null,
    height: null,
    blockData: null,
    snackbar: false,
    snackbarText: null,
  }),
  methods: {
    async fetchLastBlockHeight() {
      this.loader = this.$loading.show({
        loader: 'bars',
        opacity: 0.85,
        transition: 'none',
        height: 128,
        width: 128,
        'is-full-page': true,
        'background-color': '#FF0000',
      });
      const ret = hlp.getLastBlockHeight();
      ret.then((res) => {
        this.height = res;
        this.loader.hide();
      });
    },
    async fetchBlockData() {
      this.loader = this.$loading.show({
        loader: 'bars',
        opacity: 0.85,
        transition: 'none',
        height: 128,
        width: 128,
        'is-full-page': true,
        'background-color': '#FF0000',
      });
      // const ret = hlp.getBlockData(this.height);
      // const ret = hlp.getLastBlockData();
      const ret = await hlp.getBlockDataFromHeight(this.height);
      this.blockData = JSON.stringify(ret);
      this.loader.hide();
    },
    async checkBlockExists() {
      this.loader = this.$loading.show({
        loader: 'bars',
        opacity: 0.85,
        transition: 'none',
        height: 128,
        width: 128,
        'is-full-page': true,
        'background-color': '#FF0000',
      });

      const ret = await dbutils.dbBlockExists(this.height);
      if (!ret) {
        const block = await hlp.getBlockDataFromHeight(this.height);
        this.blockData = JSON.stringify(ret);
        await dbutils.dbSetBlock(block);
      }
      this.loader.hide();
    },
    async syncDB() {
      this.loader = this.$loading.show({
        loader: 'bars',
        opacity: 0.85,
        transition: 'none',
        height: 128,
        width: 128,
        'is-full-page': true,
        'background-color': '#FF0000',
      });

      try {
        this.snackbarText = 'Block(s) ';

        const strLastBlockHeight = await hlp.getLastBlockHeight();
        const nLastBlockHeight = parseInt(strLastBlockHeight, 10);

        let nLastDBID = await dbutils.dbGetLastID();
        if (nLastDBID < 0) {
          nLastDBID = nLastBlockHeight - 5;
        }

        let bNewBlocks = false;
        if (nLastBlockHeight > nLastDBID) {
          const taskPromises = [];
          for (let n = nLastBlockHeight; n > nLastDBID; n -= 1) {
            bNewBlocks = true;
            this.snackbarText += n.toString();
            this.snackbarText += ' ';
            const strCurrentHeight = n.toString();
            const ret = dbutils.grabAndSetBlock(strCurrentHeight);
            taskPromises.push(ret);
          }
          await Promise.all(taskPromises);
        }

        if (bNewBlocks) {
          this.snackbarText += 'added to DB';
        } else {
          this.snackbarText = `DB up to date - last block height is ${strLastBlockHeight}`;
        }

        this.snackbar = true;
      } catch (err) {
        console.log(err);
      }
      this.loader.hide();
    },
  },
};

</script>
