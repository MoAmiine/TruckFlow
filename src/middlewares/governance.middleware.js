function v1Governance(req, res, next) {
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-API-Deprecated', 'true');
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', 'Sun, 01 Nov 2026 00:00:00 GMT');
    res.setHeader('Link', '</api/v2>; rel="successor-version"');
    next();
}

function v2Governance(req, res, next) {
    res.setHeader('X-API-Version', '2.0.0');
    res.setHeader('X-API-Deprecated', 'false');
    next();
}   

module.exports = {
    v1Governance,
    v2Governance
};