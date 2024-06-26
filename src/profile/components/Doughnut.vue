<template>
  <div v-if="data">
    <canvas :id="id"></canvas>
  </div>
</template>

<script setup lang="ts">
  import { PropType, ref, watch, onMounted, onUnmounted } from 'vue'
  import { Chart, registerables } from 'chart.js'

  const props = defineProps({
    data: { type: Object as PropType<GitDashboardLanguageProficiency>, required: true },
    id: { type: String, required: true }
  })

  let chartInstance: Chart<'doughnut', number[], string> | null = null

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
          datasets: [{ data: [1], backgroundColor: ['#333'], borderWidth: 0 }]
        }
      : {
          labels: Object.keys(props.data),
          datasets: [
            {
              data: Object.values(props.data),
              backgroundColor: ['#0077b6', '#48cae4', '#caf0f8'],
              borderWidth: 2,
              borderColor: '',
              borderRadius: 5
            }
          ]
        }

    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        plugins: {
          legend: {
            display: false
          }
        },
        responsive: false,
        cutout: '80%',
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
