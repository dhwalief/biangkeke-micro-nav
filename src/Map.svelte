<script lang="ts">
  import { onMount } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import L from 'leaflet';

  // Definisikan tipe data yang diterima komponen ini
  export let ruteGeojson: string;
  export let koordinatAkhir: [number, number];

  let mapElement: HTMLElement; // Deklarasi tipe elemen DOM

  onMount(async () => {
    const map = L.map(mapElement).setView([-5.558, 119.997], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    }).addTo(map);

    const res = await fetch(`/${ruteGeojson}`);
    const geoData = await res.json();

    const ruteLayer = L.geoJSON(geoData, {
      style: { color: '#1267ff', weight: 5, opacity: 0.8 }
    }).addTo(map);

    map.fitBounds(ruteLayer.getBounds(), { padding: [20, 20] });
    L.marker(koordinatAkhir).addTo(map).bindPopup("Tujuan Akhir");
  });
</script>

<style>
  .map-container { height: 50vh; width: 100%; z-index: 1; }
</style>

<div bind:this={mapElement} class="map-container"></div>