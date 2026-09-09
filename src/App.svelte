<script lang="ts">
  import { onMount } from 'svelte';
  import Map from './Map.svelte';
  import Stepper from './Stepper.svelte';

  // Gunakan 'any' sementara atau null
  let dataTujuan: any = null;

  onMount(async () => {
    const res = await fetch('/destinasi.json');
    const data = await res.json();
    
    dataTujuan = data.dusun[0].rumah[0]; 
  });
</script>

<style>
  :global(body) { margin: 0; padding: 0; font-family: sans-serif; }
  main { display: flex; flex-direction: column; height: 100vh; }
</style>

<main>
  {#if dataTujuan}
    <Map 
      ruteGeojson={dataTujuan.rute_geojson} 
      koordinatAkhir={dataTujuan.koordinat_akhir} 
    />
    <Stepper 
      langkah={dataTujuan.langkah} 
      namaTujuan={dataTujuan.nama} 
    />
  {:else}
    <div style="padding: 20px;">Memuat aplikasi rute desa...</div>
  {/if}
</main>