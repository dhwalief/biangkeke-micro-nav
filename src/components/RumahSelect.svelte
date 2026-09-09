<script lang="ts">
  interface Rumah {
    id: string;
    nama: string;
    rute_geojson: string;
    koordinat_akhir: [number, number];
    langkah: any[];
  }

  interface Dusun {
    id: string;
    nama: string;
    rumah: Rumah[];
  }

  export let dusun: Dusun;
  export let onSelect: (rumah: Rumah) => void;
  export let onBack: () => void;
</script>

<div class="screen-container">
  <div class="top-nav">
    <button type="button" class="back-btn" on:click={onBack} aria-label="Kembali ke daftar dusun">
      ←
    </button>
    <div class="header-text">
      <span class="dusun-tag">{dusun.nama}</span>
      <h1 class="title">Pilih Tujuan</h1>
    </div>
  </div>

  <div class="list">
    {#each dusun.rumah as item}
      <button 
        type="button" 
        class="rumah-card"
        on:click={() => onSelect(item)}
      >
        <div class="card-info">
          <h2 class="rumah-name">{item.nama}</h2>
          <p class="rumah-sub">Rute resmi via jalan desa & lorong</p>
        </div>
        <div class="card-action">
          <span class="action-arrow">➔</span>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .screen-container {
    display: flex;
    flex-direction: column;
    padding: 24px 20px;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .top-nav {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  .back-btn {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-main);
    font-size: 18px;
    font-weight: 700;
    transition: background 0.15s ease, transform 0.1s ease;
  }

  .back-btn:active {
    transform: scale(0.94);
    background: var(--bg-subtle);
  }

  .header-text {
    display: flex;
    flex-direction: column;
  }

  .dusun-tag {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 500;
  }

  .title {
    font-size: 20px;
    font-weight: 700;
    margin: 2px 0 0 0;
    color: var(--text-main);
    letter-spacing: -0.02em;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rumah-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: var(--bg-card);
    border: 1.5px solid var(--border-color);
    border-radius: 14px;
    text-align: left;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
  }

  .rumah-card:active {
    transform: scale(0.98);
    border-color: var(--primary-blue);
    background: var(--bg-subtle);
  }

  .card-info {
    flex: 1;
  }

  .rumah-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-main);
    margin: 0 0 4px 0;
  }

  .rumah-sub {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }

  .card-action {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
  }

  .action-arrow {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary-blue);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
  }
</style>
