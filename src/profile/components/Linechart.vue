<template>
  <div v-if="data">
    <canvas :id="id" width="500" height="300"></canvas>
  </div>
</template>

<script setup lang="ts">
  import { PropType, ref, watch, onMounted, onUnmounted } from 'vue'
  import { Chart, registerables } from 'chart.js'
  import { generateShades } from '~/common/helpers/utils'

  const props = defineProps({
    data: { type: Object as PropType<GitDashboardLanguageProficiency>, required: true },
    id: { type: String, required: true },
    mainColor: { type: String, default: '#3694F2' }
  })

  let chartInstance: Chart<'line', number[], string> | null = null

  const init = () => {
    Chart.register(...registerables)
    Chart.defaults.color = '#fff'
  }

  // TODO: remove dummy
  const renderChart = (dummy = false) => {
    const ctx = document.getElementById(props.id) as HTMLCanvasElement

    if (chartInstance) {
      chartInstance.destroy()
    }

    const chartData = dummy
      ? {
          labels: ['Loading'],
          datasets: [{ data: [1], backgroundColor: ['#fff'] }]
        }
      : {
          labels: Object.keys(props.data),
          datasets: [
            {
              data: Object.values(props.data),
              borderColor: props.mainColor,
              fill: false,
              tension: 0.4,
              pointRadius: 0
            }
          ]
        }

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false // Remove the background grid
            },
            ticks: {
              color: '#fff' // Set the x-axis color to white
            }
          },
          y: {
            grid: {
              display: false, // Remove the background grid
              borderColor: '#fff'
            },
            ticks: {
              color: '#fff' // Set the y-axis color to white
            }
          }
        },
        responsive: false,
        animation: {
          duration: dummy ? 0 : 1000
        }
      }
    })
  }

  onMounted(() => {
    renderChart(true)
  })

  watch(
    () => props.data,
    () => {
      renderChart()
    }
  )

  init()
</script>
