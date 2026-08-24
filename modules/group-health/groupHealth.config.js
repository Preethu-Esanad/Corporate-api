/**
 * The "registration" for the Group Health product line — category/section/doc-type
 * shape consumed by groupHealth.model.js and the admin UI. Extend this as the
 * corporate C-IOS module set grows past Group Health.
 */
module.exports = {
  categories: ["employees", "dependents"],
  sections: ["company-details", "census", "plan-preferences", "documents"],
  docTypes: ["trade-license", "employee-census", "previous-policy", "claims-history"],
  statuses: ["draft", "submitted", "quoted", "placed", "cancelled"],
};
