<template>
  <div>
    <div v-if="isLoading" class="loading-placeholder animate-pulse"></div>
    <canvas :id="id" v-show="!isLoading"></canvas>
  </div>
</template>

<script setup lang="ts">
  import { PropType, ref, watch, onMounted, onUnmounted } from 'vue'
  import { Chart, ChartTypeRegistry, registerables } from 'chart.js'
  import ChartDataLabels from 'chartjs-plugin-datalabels'
  import { generateShades } from '~/common/helpers/utils'

  const props = defineProps({
    data: { type: Object as PropType<GitLanguagePortfolio>, required: true },
    id: { type: String, required: true },
    mainColor: { type: String, default: '#3694F2' }
  })

  const isLoading = ref(true)
  let chartInstance: Chart<keyof ChartTypeRegistry, number[], string> | null = null

  const initChart = () => {
    const ctx = document.getElementById(props.id) as HTMLCanvasElement

    const chartData = {
      labels: Object.keys(props.data),
      datasets: [
        {
          data: Object.values(props.data),
          backgroundColor: [...generateShades(props.mainColor, 5)].reverse(),
          borderWidth: 1.5,
          borderColor: '#9DD40',
          borderRadius: 5,
          cutout: '80%'
        }
      ]
    }

    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      plugins: [ChartDataLabels],
      options: {
        layout: {
          padding: 10
        },
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            anchor: 'start',
            align: 'start',
            offset: 20,
            font: {
              weight: 'bold',
              size: 14
            },
            color: '#fff',
            padding: {
              top: 4,
              bottom: 4,
              left: 4,
              right: 4
            },
            clip: false,
            formatter: (value, context) =>
              value > 20 ? context.chart.data.labels?.[context.dataIndex] : null
          }
        },
        responsive: true,
        maintainAspectRatio: true, // Allow the chart to grow beyond its aspect ratio
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
    width: 250px;
    height: 250px;
    border-radius: 100%;
    background-color: transparent;
    border: 20px solid #2b2f36;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    margin: 15px;
  }

  canvas {
    width: 250px;
    height: 250px;
  }
</style>
