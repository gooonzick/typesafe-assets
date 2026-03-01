<script setup lang="ts">
import { asset } from "../generated/public.gen";
</script>

<template>
  <img :src="asset('/images/hero.png')" alt="hero" />
</template>
