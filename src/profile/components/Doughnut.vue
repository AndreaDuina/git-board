<template>
  <div v-if="data">
    <canvas :id="id"></canvas>
  </div>
</template>

<script setup lang="ts">
  import { PropType, ref, watch, onMounted, onUnmounted } from 'vue'
  import { Chart, registerables } from 'chart.js'

  Chart.register(...registerables)
  Chart.defaults.color = '#fff'

  const props = defineProps({
    data: { type: Object as PropType<GitDashboardLanguageProficiency>, required: true },
    id: { type: String, required: true }
  })

  const chartInstance = ref<Chart<'doughnut', number[], string> | null>(null)

  const renderChart = (dummy = false) => {
    const ctx = document.getElementById(props.id) as HTMLCanvasElement

    if (chartInstance.value) {
      chartInstance.value.destroy()
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

    chartInstance.value = new Chart(ctx, {
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
</script>
