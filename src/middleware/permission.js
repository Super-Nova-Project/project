module.exports = (req, res, next) => {
    let approved = req.course.owner == req.user.email;
    approved? next() : next('Access Denied');
}