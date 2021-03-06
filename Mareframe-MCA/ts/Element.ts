﻿module Mareframe {
    export module DST{
        export class Element {
            private m_data: any[][] = [];
            private m_id: string = "elmtbroken"
            private m_name: string = "Element";
            private m_description: string = "write description here";
            private m_type: number = 0;
            private m_weightingMethod: number = 1;
            private m_connections: Connection[] = [];
            public m_easelElmt: createjs.Container = new createjs.Container();;

            constructor(p_id: string) {
                if (p_id.substr(0, 4) == "elmt")
                { this.m_id = p_id; }
                else { this.m_id = "elmt" + p_id; }

            }
            getData(p_index?: number, p_secondary?: number): any{
                if (p_index != undefined) {
                    var data = this.m_data[p_index];
                    if (p_secondary != undefined && data instanceof Array)
                        data = data[p_secondary];
                    return data;
                } else {
                    return this.m_data;
                }
            }

            setData(p_data: any, p_index?: number, p_secondary?: number): any {
                if (p_index != undefined) {
                    if (p_secondary != undefined && this.m_data[p_index] instanceof Array) {
                        this.m_data[p_index][p_secondary] = p_data;
                    } else {
                        this.m_data[p_index] = p_data
                    }
                } else {
                    this.m_data = p_data;
                }
            }
            getID(): string {
                return this.m_id;
            }
            setID(p_id: string): string {
                if (p_id.substr(0, 4) == "elmt")
                { this.m_id = p_id; }
                else { this.m_id = "elmt" + p_id; }
                this.m_easelElmt.name = p_id;
                return this.m_id;

            }
            getName(): string {
                return this.m_name;
            }
            setName(p_name: string): void {
                this.m_name = p_name;
            }
            getDescription(): string {
                return this.m_description;
            }
            setDescription(p_description: string): void {
                this.m_description = p_description
            }
            getType(): number {
                return this.m_type;
            }
            setType(p_type: number): void {
                this.m_type = p_type;
            }
            getMethod(): number {
                return this.m_weightingMethod
            }
            setMethod(p_weightingMethod: number): void {
                this.m_weightingMethod = p_weightingMethod;
            }

            deleteConnection(p_connID: string): boolean {
                var key = 0;
                this.m_connections.every(function (p_conn: Connection) {
                    if (p_conn.getID() === p_connID)
                        return false;
                    else {
                        key++
                        return true;
                    }
                });
                if (key >= this.m_connections.length)
                    return false;
                else {
                    this.m_connections.splice(key, 1);
                    return true;
                }
            }

            deleteAllConnections(): any {
                this.m_connections.forEach(function (p_conn: Connection) {

                });
            }
            addConnection(p_conn: Connection): void {
                this.m_connections.push(p_conn)
            }
            getConnections(): Connection[] {
                return this.m_connections;
            }

            toJSON(): any {
                return { posX: this.m_easelElmt.x, posY: this.m_easelElmt.y, elmtID: this.getID(), elmtName: this.getName(), elmtDesc: this.getDescription(), elmtType: this.getType(), elmtData: this.getData(), elmtWghtMthd: this.getMethod() };
            }

            fromJSON(p_jsonElmt: any): void {
                this.m_easelElmt.x = p_jsonElmt.posX;
                this.m_easelElmt.y = p_jsonElmt.posY;
                this.setID(p_jsonElmt.elmtID);
                this.setName(p_jsonElmt.elmtName);
                this.setName(p_jsonElmt.elmtName);
                this.setDescription(p_jsonElmt.elmtDesc);
                this.setType(p_jsonElmt.elmtType);
                this.setData(p_jsonElmt.elmtData);
                this.setMethod(p_jsonElmt.elmtWghtMthd);
            }
        }
    }
}