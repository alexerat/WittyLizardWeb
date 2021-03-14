<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * BroadcastViewers
 *
 * @ORM\Table(name="Online_Comms.Broadcast_Viewers", indexes={@ORM\Index(name="fk_Broadcast_Viewers_Global_Broadcast_Table1_idx", columns={"Broadcast_ID"}), @ORM\Index(name="fk_Broadcast_Viewers_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class BroadcastViewers
{

    /**
     * @var \App\Entity\GlobalBroadcastTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\GlobalBroadcastTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Broadcast_ID", referencedColumnName="Broadcast_ID")
     * })
     */
    private $brodId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Join_Time", type="datetime")
    */
    private $joinTime;

    /**
     * Set joinTime
     *
     * @param \DateTime $joinTime
     *
     * @return BroadcastViewers
     */
    public function setJoinTime($joinTime)
    {
        $this->joinTime = $joinTime;

        return $this;
    }

    /**
     * Get joinTime
     *
     * @return \DateTime
     */
    public function getJoinTime()
    {
        return $this->joinTime;
    }

    /**
     * Set brodId
     *
     * @param \App\Entity\GlobalBroadcastTable $brodId
     *
     * @return BroadcastViewers
     */
    public function setBrodId(\App\Entity\GlobalBroadcastTable $brodId = null)
    {
        $this->brodId = $brodId;

        return $this;
    }

    /**
     * Get brodId
     *
     * @return \App\Entity\GlobalBroadcastTable
     */
    public function getBrodId()
    {
        return $this->brodId;
    }

    /**
     * Set user
     *
     * @param \App\Entity\UserTable $user
     *
     * @return BroadcastViewers
     */
    public function setUser(\App\Entity\UserTable $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \App\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }
}
