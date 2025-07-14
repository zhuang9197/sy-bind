export class SyListResult {
    containerMethods;
    constructor(containerMethods) {
        this.containerMethods = containerMethods;
    }
    pop(method, callback) {
        this.containerMethods.addPop(method);
        return this;
    }
    push(method) {
        this.containerMethods.addPush(method);
        return this;
    }
    clear(listMethodType) {
        this.containerMethods.clear(listMethodType);
        return this;
    }
}
//# sourceMappingURL=SyResult.js.map