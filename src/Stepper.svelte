<script lang="ts">
  // Mendefinisikan bentuk data langkah dari JSON
  interface Langkah {
    urutan?: number;
    instruksi: string;
    foto?: string;
  }

  export let langkah: Langkah[];
  export let namaTujuan: string;

  let currentStep = 0;

  function next() {
    if (currentStep < langkah.length - 1) currentStep++;
  }
  function prev() {
    if (currentStep > 0) currentStep--;
  }
</script>

<style>
  .stepper-container { height: 50vh; padding: 15px; background: #f8f9fa; overflow-y: auto; box-sizing: border-box; }
  h3 { margin-top: 0; font-size: 1.1rem; color: #333; }
  .kartu-foto { background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 15px; }
  img { width: 100%; height: 200px; object-fit: cover; border-radius: 6px; background: #ddd; }
  .teks-instruksi { font-size: 1rem; margin: 10px 0; line-height: 1.4; }
  .nav-buttons { display: flex; justify-content: space-between; gap: 10px; }
  button { flex: 1; padding: 12px; border: none; border-radius: 6px; background: #1267ff; color: white; font-weight: bold; cursor: pointer; }
  button:disabled { background: #ccc; cursor: not-allowed; }
</style>

<div class="stepper-container">
  <h3>Menuju: {namaTujuan}</h3>

  {#if langkah && langkah.length > 0}
    {@const aktif = langkah[currentStep]}
    
    <div class="kartu-foto">
      <img src={aktif.foto || 'https://via.placeholder.com/800x400?text=Foto+Survei+Belum+Ada'} alt="Patokan Jalan" />
      <p class="teks-instruksi"><b>Langkah {aktif.urutan || currentStep + 1}:</b> {aktif.instruksi || 'Teks instruksi belum diisi.'}</p>
    </div>

    <div class="nav-buttons">
      <button on:click={prev} disabled={currentStep === 0}>Sebelumnya</button>
      <button on:click={next} disabled={currentStep === langkah.length - 1}>Selanjutnya</button>
    </div>
  {:else}
    <p>Data instruksi jalan belum tersedia.</p>
  {/if}
</div>