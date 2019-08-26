class DirctionStateMachine {
    private status: number = -1;

    get state(): number {
        return this.status % 2;
    }

    public add() {
        this.status ++;
    }
}

export default DirctionStateMachine;
