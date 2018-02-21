module.exports = function timestamp (allocations) {
  const now = new Date().toISOString()
  return allocations.map(allocation => ({
    ...allocation,
    created_at: now
  }))
}
