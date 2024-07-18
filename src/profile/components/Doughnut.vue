<template>
  <div>
    <div v-if="isLoading" class="loading-placeholder animate-pulse"></div>
    <canvas :id="id" v-show="!isLoading"></canvas>
  </div>
</template>

<script setup lang="ts">
  import { PropType, ref, watch, onMounted, onUnmounted } from 'vue'
  import { Chart, registerables } from 'chart.js'
  import ChartDataLabels from 'chartjs-plugin-datalabels'
  import { generateShades } from '~/common/helpers/utils'

  const props = defineProps({
    data: { type: Object as PropType<GitDashboardLanguageProficiency>, required: true },
    id: { type: String, required: true },
    mainColor: { type: String, default: '#3694F2' }
  })

  const isLoading = ref(true)
  let chartInstance: Chart<'doughnut', number[], string> | null = null

  const initChart = () => {
    const ctx = document.getElementById(props.id) as HTMLCanvasElement

    const chartData = {
      labels: Object.keys(props.data),
      datasets: [
        {
          data: Object.values(props.data),
          backgroundColor: [...generateShades(props.mainColor, 5)].reverse(),
          borderWidth: 3,
          borderColor: '#1B1B1F',
          borderRadius: 5
        }
      ]
    }

    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      plugins: [ChartDataLabels],
      options: {
        layout: {
          padding: 80
        },
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            anchor: 'end',
            align: 'end',
            offset: 10,
            borderColor: '#fff',
            borderWidth: 2,
            borderRadius: 25,
            backgroundColor: '#1B1B1F',
            color: '#fff',
            padding: {
              top: 4,
              bottom: 4,
              left: 8,
              right: 8
            },
            clip: false,
            formatter: (value, context) => context.chart.data.labels[context.dataIndex]
          }
        },
        responsive: false,
        maintainAspectRatio: false, // Allow the chart to grow beyond its aspect ratio
        cutout: '80%',
        animation: {
          duration: 1000
        }
      }
    })
  }

  onMounted(() => {
    Chart.register(...registerables, ChartDataLabels)
    Chart.defaults.color = '#fff'

    watch(
      () => props.data,
      newData => {
        if (newData && Object.keys(newData).length) {
          isLoading.value = false
          initChart()
        }
      },
      { immediate: true }
    )
  })

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.destroy()
    }
  })
</script>

<style scoped>
  .loading-placeholder {
    width: 300px;
    height: 300px;
    border-radius: 100%;
    background-color: transparent;
    border: 20px solid #2b2f36;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  canvas {
    width: 500px; /* Adjust the width as needed */
    height: 500px; /* Adjust the height as needed */
  }
</style>
