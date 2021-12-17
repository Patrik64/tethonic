<template>
  <p>{{ test }}</p>

</template>

// test

<script>
import * as dbutils from '@/lib/dbutils';

export default {
  name: 'Last10Blocks',

  data: () => ({
    loader: null,
    blocks: [],
    test: null,
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

    // fetch last 10 blocks
    const nLastBlockHeight = await dbutils.dbGetLastID();
    const lastBlockHeight = nLastBlockHeight.toString();

    const blockData = await dbutils.dbGetBlock(lastBlockHeight);
    console.log(blockData);


    this.loader.hide();
  },
};
</script>
