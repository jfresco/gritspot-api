/**
 * Decorates allocations with a `created_at` attribute, that contains the current timestamp in ISO format
 *
 * @access private
 * @param {Object[]} allocations A list of allocations
 * @return {Object[]} A new list of allocations, with the `create_at` field
 */

module.exports = function timestamp (allocations) {
  const now = new Date().toISOString()
  return allocations.map(allocation => ({
    ...allocation,
    created_at: now
  }))
}
