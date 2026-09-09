<script lang="ts">
  interface Dusun {
    id: string;
    nama: string;
    rumah: any[];
  }

  export let dusunList: Dusun[] = [];
  export let onSelect: (dusun: Dusun) => void;
</script>

<div class="screen-container">
  <div class="header">
    <span class="badge">Desa Biangkeke</span>
    <h1 class="title">Pilih Dusun</h1>
    <p class="subtitle">Ketuk dusun yang ingin Anda tuju</p>
  </div>

  <div class="list">
    {#each dusunList as dusun}
      <button 
        type="button" 
        class="dusun-btn"
        on:click={() => onSelect(dusun)}
      >
        <span class="dusun-name">{dusun.nama}</span>
        <span class="arrow">→</span>
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

  .header {
    margin-bottom: 20px;
  }

  .badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--primary-blue);
    background: rgba(30, 64, 175, 0.08);
    padding: 3px 8px;
    border-radius: 6px;
    margin-bottom: 8px;
  }

  .title {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 4px 0;
    color: var(--text-main);
  }

  .subtitle {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .dusun-btn {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-main);
    font-size: 14px;
    font-weight: 600;
    transition: background 0.15s ease, transform 0.1s ease, border-color 0.15s ease;
    text-align: left;
    width: 100%;
    box-sizing: border-box;
  }

  .dusun-btn:active {
    transform: scale(0.98);
    background: var(--bg-subtle);
    border-color: var(--primary-blue);
  }

  .dusun-name {
    flex: 1;
  }

  .arrow {
    font-size: 14px;
    color: var(--text-muted);
  }
</style>
