<template>
  <div></div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const target = route.query.to || '/dashboard'
router.replace(target)
</script>
